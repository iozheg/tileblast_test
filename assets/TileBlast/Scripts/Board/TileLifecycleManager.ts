import ParticleController from "../ParticleController";
import { TileBehaviour } from "../Services/TileBehaviourService";
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

  @property(cc.Prefab)
  private bombParticles: cc.Prefab = null;

  private tileControllersFactory: TileControllerFactory;
  private removeParticlePool: ObjectPool;
  private bombParticlePool: ObjectPool;

  private effects: {
    [key in TileBehaviour]?: ObjectPool;
  } = {};

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
    this.bombParticlePool = new ObjectPool(this.bombParticles);

    this.effects = {
      [TileBehaviour.RegionDestroyer]: this.bombParticlePool,
    };
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
    this.showEffect(tileController);
    await tileController.destroyTile();
    this.tileControllersFactory.releaseInstance(tileController);
  }

  public reset(): void {
    this.tileControllersFactory?.clearPool();
    this.removeParticlePool?.clear();
    this.bombParticlePool?.clear();
  }

  private showEffect(tileController: TileController) {
    const resolver = this.effectResolver(tileController.behaviour);
    const effect = resolver.create(this.tileContainer);
    effect.setPosition(tileController.node.position);
    const pc = effect.getComponent(ParticleController);
    pc.launch();
    pc.node.once("finished", () => {
      resolver.release(effect);
    });
  }

  private effectResolver(behaviour: string): ObjectPool {
    return this.effects[behaviour] || this.removeParticlePool;
  }
}
