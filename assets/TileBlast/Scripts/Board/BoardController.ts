import BoardModel from "./BoardModel";
import TileController from "../Tile/TileController";
import TileModel from "../Tile/TileModel";
import TileType from "../TileType";
import ComponentPooledFactory from "../Services/TileControllerFactory";
import { Point } from "../utils/Point";
import TileFactory from "../Services/TileFactory";
import TileBehaviourService from "../Services/TileBehaviourService";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoardController extends cc.Component {
  @property(cc.Integer)
  private numColumns: number = 8;

  @property(cc.Integer)
  private numRows: number = 7;

  @property(cc.Node)
  board: cc.Node = null;

  @property(cc.Node)
  tileContainer: cc.Node = null;

  @property(cc.Prefab)
  tilePrefab: cc.Prefab = null;

  @property([TileType])
  private tileTypes: TileType[] = [];

  @property([TileType])
  private specialTileTypes: TileType[] = [];

  private BoardModel: BoardModel;

  private tileFactory: TileFactory;

  private tileControllersFactory: ComponentPooledFactory;

  private behaviourService: TileBehaviourService;

  private modelToController: Map<TileModel, TileController> = new Map();

  private spawnField: number[] = [];

  private tileSize: number = 0;

  public init() {
    this.reset();

    this.tileFactory = new TileFactory();
    this.behaviourService = new TileBehaviourService();

    this.tileSize = this.tileContainer.getContentSize().width / this.numColumns;
    const types = this.tileTypes.map((type) => type.type);
    this.BoardModel = new BoardModel(
      this.numColumns,
      this.numRows,
      types,
      this.tileFactory
    );

    this.board.setContentSize(
      this.numColumns * this.tileSize,
      this.numRows * this.tileSize
    );

    this.tileControllersFactory = new ComponentPooledFactory(
      this.tilePrefab,
      this.tileContainer,
      this.tileSize,
      [...this.tileTypes, ...this.specialTileTypes],
      this.numColumns * this.numRows
    );
    this.createTiles();

    this.spawnField = new Array(this.numColumns).fill(0);
  }

  private createTiles(): void {
    for (const tileModel of this.BoardModel.tiles) {
      if (!this.modelToController.has(tileModel)) {
        this.createTile(tileModel);
      }
    }
  }

  private createTile(
    tileModel: TileModel,
    startPosition?: Point
  ): TileController {
    const tileController = this.tileControllersFactory.getInstance(tileModel);
    if (startPosition) {
      tileController.setPosition(startPosition, true);
    }

    this.modelToController.set(tileModel, tileController);

    tileController.node.on(cc.Node.EventType.TOUCH_END, this.onTileClick, this);

    return tileController;
  }

  private syncTiles(): void {
    this.spawnField.fill(0);

    for (let i = this.BoardModel.tiles.length - 1; i >= 0; i--) {
      const tileModel = this.BoardModel.tiles[i];
      let tileController = this.modelToController.get(tileModel);
      if (!tileController) {
        const pos = this.getSpawnPosition(tileModel);
        tileController = this.createTile(tileModel, pos);
      }
      tileController.setPosition(tileModel.position);
    }
  }

  private onTileClick(touchEvent: cc.Event.EventTouch): void {
    const tileNode = touchEvent.currentTarget as cc.Node;
    const tileId = tileNode.getComponent(TileController).tileId;
    const clickedTile = this.BoardModel.getTileById(tileId);

    const affectedTiles = this.behaviourService.run(
      clickedTile,
      this.BoardModel
    );
    if (affectedTiles.length > 1) {
      this.BoardModel.removeTiles(affectedTiles);
      this.removeTiles(affectedTiles);
      if (!clickedTile.behaviour) {
        const behaviour = this.behaviourService.getBehaviour(affectedTiles);
        if (behaviour) {
          const specialTile = this.tileFactory.create({
            type: "special",
            behaviour: behaviour,
            position: clickedTile.position,
          });
          this.BoardModel.setTileAt(specialTile.position, specialTile);
          this.createTile(specialTile, clickedTile.position);
        }
      }

      this.BoardModel.update();
      setTimeout(() => {
        this.syncTiles();
      }, 200);
    }
  }

  private removeTiles(tileModels: TileModel[]) {
    for (const model of tileModels) {
      const tileController = this.modelToController.get(model);
      if (tileController) {
        tileController.destroyTile().then(() => {
          tileController.node.off(
            cc.Node.EventType.TOUCH_END,
            this.onTileClick,
            this
          );
          this.tileControllersFactory.releaseInstance(tileController);
        });
      }
      this.modelToController.delete(model);
    }

    this.node.emit(BoardControllerEvent.TILES_REMOVED, tileModels);
  }

  private getSpawnPosition(tileModel: TileModel): Point {
    this.spawnField[tileModel.position.x]++;
    return {
      x: tileModel.position.x,
      y: -this.spawnField[tileModel.position.x] - 2,
    };
  }

  private reset() {
    this.modelToController.forEach((controller) => {
      controller.node.off(cc.Node.EventType.TOUCH_END, this.onTileClick, this);
      controller.node.destroy();
    });
    this.modelToController.clear();

    this.tileControllersFactory?.clearPool();
    this.tileFactory?.clearPool();

    this.spawnField = new Array(this.numColumns).fill(0);
    this.BoardModel?.clear();
  }
}

export enum BoardControllerEvent {
  TILES_REMOVED = "tiles-removed",
}
