import BoardModel from "./BoardModel";
import TileController from "../Tile/TileController";
import TileModel from "../Tile/TileModel";
import TileType from "../TileType";
import ComponentPooledFactory from "../utils/ComponentPooledFactory";
import { Point } from "../utils/Point";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoardController extends cc.Component {
  @property(cc.Integer)
  private numColumns: number = 8;

  @property(cc.Integer)
  private numRows: number = 7;

  @property(cc.Node)
  tileContainer: cc.Node = null;

  @property(cc.Prefab)
  tilePrefab: cc.Prefab = null;

  @property([TileType])
  private tileTypes: TileType[] = [];

  private BoardModel: BoardModel;

  private tileControllersFactory: ComponentPooledFactory<TileController>;

  private modelToController: Map<TileModel, TileController> = new Map();

  private spawnField: number[] = [];

  private tileSize: number = 0;

  start() {
    this.tileSize = this.tileContainer.getContentSize().width / this.numColumns;
    const types = this.tileTypes.map((type) => type.type);
    this.BoardModel = new BoardModel(this.numColumns, this.numRows, types);

    this.tileContainer.setContentSize(
      this.numColumns * this.tileSize,
      this.numRows * this.tileSize
    );

    this.tileControllersFactory = new ComponentPooledFactory(
      this.tilePrefab,
      TileController,
      this.tileContainer,
      this.numColumns * this.numRows
    );
    this.createTiles();

    this.spawnField = new Array(this.numColumns).fill(0);
  }

  private createTiles(): void {
    for (const tileModel of this.BoardModel.fieldTiles) {
      if (!this.modelToController.has(tileModel)) {
        const tileController = this.createTile(tileModel);
        this.modelToController.set(tileModel, tileController);
      }
    }
  }

  private createTile(
    tileModel: TileModel,
    startPosition?: Point
  ): TileController {
    const tileController = this.tileControllersFactory.getInstance();
    tileController.setSize({ x: this.tileSize, y: this.tileSize });
    tileController.setPosition(startPosition ?? tileModel.position, true);

    const spriteFrame = this.tileTypes.find(
      (type) => type.type === tileModel.type
    )?.sprite;

    tileController.setup(tileModel, spriteFrame);
    tileController.setDebugInfo(tileModel.id, tileModel.group.id);

    tileController.node.on(cc.Node.EventType.TOUCH_END, this.onTileClick, this);

    return tileController;
  }

  private updateTiles(): void {
    this.spawnField.fill(0);

    for (let i = this.BoardModel.fieldTiles.length - 1; i >= 0; i--) {
      const tileModel = this.BoardModel.fieldTiles[i];
      let tileController = this.modelToController.get(tileModel);
      if (!tileController) {
        const pos = this.getSpawnPosition(tileModel);
        tileController = this.createTile(tileModel, pos);
        this.modelToController.set(tileModel, tileController);
      }
      tileController.setPosition(tileModel.position);
      tileController.setDebugInfo(tileModel.id, tileModel.group.id);
    }
  }

  private onTileClick(touchEvent: cc.Event.EventTouch): void {
    const tileNode = touchEvent.currentTarget as cc.Node;
    const tileId = tileNode.getComponent(TileController).tileId;
    const tileModel = this.BoardModel.getTileById(tileId);
    if (tileModel?.group.tileCount > 1) {
      this.removeTiles(tileModel.group.tiles);
      this.BoardModel.removeGroupTiles(tileModel.group);

      this.updateTiles();
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
  }

  private getSpawnPosition(tileModel: TileModel): Point {
    this.spawnField[tileModel.position.x]++;
    return {
      x: tileModel.position.x,
      y: -this.spawnField[tileModel.position.x] - 2,
    };
  }
}
