import Tile from "./Tile";

export default class TileGroup {
  readonly id: number;

  type: string;

  private tiles: Tile[] = [];

  get tileCount(): number {
    return this.tiles.length;
  }

  constructor(id: number) {
    this.id = id;
  }

  addTile(tile: Tile): void {
    tile.group = this;
    this.tiles.push(tile);
  }
}
