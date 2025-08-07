export default class PooledFactory<T> {
  private pool: T[] = [];

  constructor(
    private ctor: new (...args: any[]) => T,
    initialSize: number = 0
  ) {
    this.pool = new Array(initialSize).fill(null).map(() => new this.ctor());
  }

  public create(...args: any[]): T {
    let instance: T;

    if (this.pool.length > 0) {
      instance = this.pool.pop();
    } else {
      console.warn(
        `PooledFactory<${this.ctor.name}>: pool is empty, creating new instance`
      );
      instance = new this.ctor(...args);
    }

    return instance;
  }

  public releaseInstance(instance: T): void {
    this.pool.push(instance);
  }

  public clearPool(): void {
    this.pool = [];
  }
}
