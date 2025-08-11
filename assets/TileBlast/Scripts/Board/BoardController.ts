import BoardModel from "./BoardModel";
import TileController from "../Tile/TileController";
import TileModel from "../Tile/TileModel";
import TileType from "../TileType";
import { Point } from "../utils/Point";
import TileModelFactory from "../Services/TileModelFactory";
import TileBehaviourService from "../Services/TileBehaviourService";
import { delay, getDistance } from "../utils/Utils";
import EffectProcessor, { TileEffect } from "../utils/EffectProcessor";
import TileLifecycleManager from "./TileLifecycleManager";

const { ccclass, property } = cc._decorator;

type EffectData = {
  cause: TileModel;
};

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

  @property
  private usedTileTypes = 4;

  @property([TileType])
  private tileTypes: TileType[] = [];

  @property([TileType])
  private specialTileTypes: TileType[] = [];

  @property(TileLifecycleManager)
  private tileLifecycleManager: TileLifecycleManager = null;

  private BoardModel: BoardModel;

  private tileModelFactory: TileModelFactory;

  private behaviourService: TileBehaviourService;

  private modelToController: Map<TileModel, TileController> = new Map();

  private spawnField: number[] = [];

  private baseDelay = 50;

  private effectProcessor: EffectProcessor<EffectData> = new EffectProcessor(
    (effect) => this.handleEffect(effect),
    () => {
      this.spawnField.fill(0);
    }
  );

  public init() {
    this.reset();

    this.tileModelFactory = new TileModelFactory();
    this.behaviourService = new TileBehaviourService();

    const tileSize =
      this.tileContainer.getContentSize().width / this.numColumns;

    const types = this.tileTypes
      .slice(0, this.usedTileTypes)
      .map((type) => type.type);
    this.BoardModel = new BoardModel(
      this.numColumns,
      this.numRows,
      types,
      this.tileModelFactory
    );

    this.board.setContentSize(
      this.numColumns * tileSize,
      this.numRows * tileSize
    );

    this.tileLifecycleManager.setup(
      tileSize,
      this.tileTypes,
      this.specialTileTypes,
      this.numColumns,
      this.numRows
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
    const tileController = this.tileLifecycleManager.createTile(
      tileModel,
      startPosition
    );
    this.modelToController.set(tileModel, tileController);

    tileController.node.on(cc.Node.EventType.TOUCH_END, this.onTileClick, this);

    return tileController;
  }

  private onTileClick(touchEvent: cc.Event.EventTouch): void {
    const tileNode = touchEvent.currentTarget as cc.Node;
    const tileId = tileNode.getComponent(TileController).tileId;
    const clickedTile = this.BoardModel.getTileById(tileId);

    this.effectProcessor.addEffect(0, {
      cause: clickedTile,
    });
  }

  private async handleEffect(effect: TileEffect<EffectData>) {
    const affectedTiles = this.behaviourService.run(
      effect.data.cause,
      this.BoardModel
    );

    if (affectedTiles.length > 1) {
      this.node.emit(BoardControllerEvent.MOVE_PERFORMED);

      let specialTile: TileModel | null;
      if (effect.data.cause.behaviour) {
        this.checkChainReaction(affectedTiles, effect.data.cause);
      } else {
        specialTile = this.createSpecialTile(
          affectedTiles,
          effect.data.cause.position
        );
      }

      this.BoardModel.stageRemoving(affectedTiles, effect.commitId);
      if (specialTile) {
        this.BoardModel.setTileAt(specialTile.position, specialTile);
        this.createTile(specialTile, specialTile.position);
      }
      await this.animateRemoveTiles(effect, affectedTiles);

      this.node.emit(BoardControllerEvent.TILES_REMOVED, affectedTiles);

      await delay(50);
      this.BoardModel.commit(effect.commitId);
      this.syncTiles(effect.commitId);
    } else {
      this.modelToController.get(effect.data.cause)?.rejectAction();
    }
  }

  private checkChainReaction(affectedTiles: TileModel[], causeTile: TileModel) {
    affectedTiles.forEach((tile) => {
      if (causeTile !== tile && tile.behaviour && tile.commitId === 0) {
        const distance = getDistance(causeTile.position, tile.position);
        this.effectProcessor.addEffect(distance * this.baseDelay, {
          cause: tile,
        });
      }
    });
  }

  private createSpecialTile(
    tilesToRemove: TileModel[],
    causePosition: Point
  ): TileModel {
    const behaviour = this.behaviourService.getBehaviour(tilesToRemove);
    if (behaviour) {
      const specialTile = this.tileModelFactory.create({
        type: "special",
        behaviour: behaviour,
        position: causePosition,
      });
      return specialTile;
    }
    return null;
  }

  private async animateRemoveTiles(
    effect: TileEffect<EffectData>,
    tileModels: TileModel[]
  ) {
    const animations: Promise<void>[] = [];

    for (const model of tileModels) {
      const tileController = this.modelToController.get(model);
      if (tileController) {
        const distance = effect.data.cause.behaviour
          ? getDistance(effect.data.cause.position, model.position)
          : 0;
        const anim = delay(distance * this.baseDelay).then(async () => {
          await this.tileLifecycleManager.removeTile(tileController);
          tileController.node.off(
            cc.Node.EventType.TOUCH_END,
            this.onTileClick,
            this
          );
        });
        animations.push(anim);
      }
      this.modelToController.delete(model);
    }

    await Promise.all(animations);
  }

  private syncTiles(commitId: number): void {
    for (let i = this.BoardModel.tiles.length - 1; i >= 0; i--) {
      const tileModel = this.BoardModel.tiles[i];

      let tileController = this.modelToController.get(tileModel);
      if (!tileController && tileModel.commitId === commitId) {
        const pos = this.getSpawnPosition(tileModel);
        tileController = this.createTile(tileModel, pos);
        tileModel.commitId = 0;
      }
      tileController?.setPosition(tileModel.position);
    }
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

    this.tileLifecycleManager.reset();
    this.tileModelFactory?.clearPool();

    this.spawnField = new Array(this.numColumns).fill(0);
    this.BoardModel?.clear();
  }
}

export enum BoardControllerEvent {
  MOVE_PERFORMED = "move-performed",
  TILES_REMOVED = "tiles-removed",
}
