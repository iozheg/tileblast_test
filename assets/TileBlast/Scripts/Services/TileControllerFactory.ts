import TileController from "../Tile/TileController";
import TileModel from "../Tile/TileModel";
import TileType from "../TileType";

export default class TileControllerFactory {
  private pool: TileController[] = [];
  private prefab: cc.Prefab;
  private parent: cc.Node;
  private tileTypes: TileType[];
  private tileSize: number;

  constructor(
    prefab: cc.Prefab,
    parent: cc.Node,
    tileSize: number,
    tileTypes: TileType[],
    initialSize: number = 0
  ) {
    this.prefab = prefab;
    this.parent = parent;
    this.tileSize = tileSize;
    this.tileTypes = tileTypes;

    this.pool = new Array(initialSize).fill(null).map(() => {
      const instance = cc.instantiate(this.prefab);
      instance.parent = this.parent;
      instance.active = false;
      return instance.getComponent(TileController);
    });
  }

  public getInstance(tileModel: TileModel): TileController {
    let component: TileController;

    if (this.pool.length > 0) {
      component = this.pool.pop();
    } else {
      const instance = cc.instantiate(this.prefab);
      instance.parent = this.parent;
      component = instance.getComponent(TileController);
    }

    component.setSize({ x: this.tileSize, y: this.tileSize });
    component.setPosition(tileModel.position, true);

    component.setup(
      tileModel,
      this.getSpriteFrame(tileModel.type, tileModel.behaviour)
    );

    component.node.active = true;
    return component;
  }

  public releaseInstance(instance: TileController): void {
    this.pool.push(instance);
    instance.node.active = false;
  }

  public clearPool(): void {
    for (const instance of this.pool) {
      instance.destroy();
    }
    this.pool = [];
  }

  private getSpriteFrame(
    type: string,
    behaviour: string
  ): cc.SpriteFrame | null {
    const searchString = type === "special" ? behaviour : type;
    const tileType = this.tileTypes.find((t) => t.type === searchString);
    return tileType ? tileType.sprite : null;
  }
}
