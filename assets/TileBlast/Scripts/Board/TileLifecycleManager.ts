import ParticleController from "../ParticleController";
import TileControllerFactory from "../Services/TileControllerFactory";
import TileController from "../Tile/TileController";
import TileModel from "../Tile/TileModel";
import TileType from "../TileType";
import ObjectPool from "../utils/ObjectPool";
import { Point } from "../utils/Point";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileLifecycleManager extends cc.Component {
  @property(cc.Node)
  tileContainer: cc.Node = null;

  @property(cc.Prefab)
  tilePrefab: cc.Prefab = null;

  @property(cc.Prefab)
  private tileRemoveParticles: cc.Prefab = null;

  private tileControllersFactory: TileControllerFactory;
  private removeParticlePool: ObjectPool;

  public setup(
    tileSize: number,
    tileTypes: TileType[],
    specialTileTypes: TileType[],
    numColumns: number,
    numRows: number
  ): void {
    this.tileControllersFactory = new TileControllerFactory(
      this.tilePrefab,
      this.tileContainer,
      tileSize,
      [...tileTypes, ...specialTileTypes],
      numColumns * numRows
    );

    this.removeParticlePool = new ObjectPool(this.tileRemoveParticles);
  }

  public createTile(
    tileModel: TileModel,
    startPosition?: Point
  ): TileController {
    const tileController = this.tileControllersFactory.getInstance(tileModel);
    if (startPosition) {
      tileController.setPosition(startPosition, true);
    }

    return tileController;
  }

  public async removeTile(tileController: TileController): Promise<void> {
    const effect = this.removeParticlePool.create(this.tileContainer);
    effect.setPosition(tileController.node.position);
    const pc = effect.getComponent(ParticleController);
    pc.launch();
    pc.node.once("finished", () => {
      this.removeParticlePool.release(effect);
    });

    await tileController.destroyTile();
    this.tileControllersFactory.releaseInstance(tileController);
  }

  public reset(): void {
    this.tileControllersFactory?.clearPool();
  }
}
