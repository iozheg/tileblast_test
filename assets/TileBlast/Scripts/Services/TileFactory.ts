import TileModel from "../Tile/TileModel";
import { Point } from "../utils/Point";

export default class TileFactory {
  private pool: TileModel[] = [];

  public create(options: TileOptions = {}): TileModel {
    let tile: TileModel;
    if (this.pool.length > 0) {
      tile = this.pool.pop()!;
    } else {
      tile = new TileModel();
    }
    tile.id = this.generateId();
    tile.commitId = 0;
    tile.position = options.position || tile.position;
    tile.type = options.type || tile.type;
    tile.behaviour = options.behaviour || null;
    return tile;
  }

  public release(tile: TileModel): void {
    this.pool.push(tile);
  }

  public clearPool(): void {
    this.pool = [];
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}

export type TileOptions = {
  position?: Point;
  type?: typeof TileModel.prototype.type;
  behaviour?: typeof TileModel.prototype.behaviour;
};
