import TileModel from "./TileModel";

export default class TileGroupModel {
  readonly id: number;

  type: string;

  private tilesModels: TileModel[] = [];

  get tileCount(): number {
    return this.tilesModels.length;
  }

  get tiles(): TileModel[] {
    return this.tilesModels;
  }

  constructor(id: number) {
    this.id = id;
  }

  addTile(tile: TileModel): void {
    tile.group = this;
    this.tilesModels.push(tile);
  }
}
