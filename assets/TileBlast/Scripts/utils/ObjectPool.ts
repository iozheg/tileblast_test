export default class ObjectPool {
  private prefab: cc.Prefab = null;

  private pool: cc.Node[] = [];

  public constructor(prefab: cc.Prefab) {
    this.prefab = prefab;
  }

  public create(parent?: cc.Node): cc.Node {
    let particle: cc.Node;
    if (this.pool.length > 0) {
      particle = this.pool.pop()!;
    } else {
      particle = cc.instantiate(this.prefab);
    }
    particle.active = true;
    if (parent) {
      parent.addChild(particle);
    }
    return particle;
  }

  public release(particle: cc.Node): void {
    particle.removeFromParent();
    particle.active = false;
    this.pool.push(particle);
  }

  public clear(): void {
    this.pool.forEach((particle) => {
      particle.destroy();
    });
    this.pool.length = 0;
  }
}
