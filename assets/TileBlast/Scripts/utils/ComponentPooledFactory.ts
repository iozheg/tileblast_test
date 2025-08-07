export default class ComponentPooledFactory<T extends cc.Component> {
  private pool: T[] = [];
  private prefab: cc.Prefab;
  private componentType: new () => T;
  private parent: cc.Node;

  constructor(
    prefab: cc.Prefab,
    componentType: new () => T,
    parent: cc.Node,
    initialSize: number = 0
  ) {
    this.prefab = prefab;
    this.componentType = componentType;
    this.parent = parent;

    this.pool = new Array(initialSize).fill(null).map(() => {
      const instance = cc.instantiate(this.prefab);
      instance.parent = this.parent;
      instance.active = false;
      return instance.getComponent(this.componentType);
    });
  }

  public getInstance(): T {
    let component: T;

    if (this.pool.length > 0) {
      component = this.pool.pop();
    } else {
      const instance = cc.instantiate(this.prefab);
      instance.parent = this.parent;
      component = instance.getComponent(this.componentType);
    }

    component.node.active = true;
    return component;
  }

  public releaseInstance(instance: T): void {
    this.pool.push(instance);
    instance.node.active = false;
  }

  public clearPool(): void {
    for (const instance of this.pool) {
      instance.destroy();
    }
    this.pool = [];
  }
}
