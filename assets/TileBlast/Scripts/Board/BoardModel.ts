import TileModel from "../Tile/TileModel";
import TileGroupModel from "../Tile/TileGroupModel";
import { Point } from "../utils/Point";

export default class BoardModel {
  private tiles: TileModel[] = [];
  private tileGroups: TileGroupModel[] = [];
  private tileTypes: string[] = [];
  private numColumns: number;
  private numRows: number;

  get fieldTiles(): TileModel[] {
    return this.tiles;
  }

  constructor(numColumns: number, numRows: number, tileTypes: string[]) {
    this.numColumns = numColumns;
    this.numRows = numRows;
    this.tileTypes = tileTypes;
  }

  public getTileAt(row: number, col: number): TileModel | null {
    const index = this.getTileIndexAt(row, col);
    return index !== -1 ? this.tiles[index] : null;
  }

  public getTileById(id: number): TileModel | null {
    return this.tiles.find((tile) => tile && tile.id === id) || null;
  }

  public generateTiles(): void {
    this.tiles = [];
    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numColumns; col++) {
        const type =
          this.tileTypes[Math.floor(Math.random() * this.tileTypes.length)];
        const tile = new TileModel(this.tiles.length, row, col, type);
        this.tiles.push(tile);
      }
    }
  }

  public assignGroups(): void {
    for (const tile of this.tiles) {
      tile && (tile.group = null);
    }
    this.tileGroups = [];

    for (const tile of this.tiles) {
      if (tile && !tile.group) {
        const group = new TileGroupModel(this.tileGroups.length);
        this.tileGroups.push(group);
        this.fillGroup(group, tile);
      }
    }
  }

  public removeGroupTiles(group: TileGroupModel): TileModel[] {
    for (let i = 0; i < this.tiles.length; i++) {
      if (this.tiles[i] && this.tiles[i].group === group) {
        this.tiles[i] = null;
      }
    }

    return group.tiles;
  }

  public updateTilesPosition(): void {
    for (let i = this.tiles.length - 1; i >= 0; i--) {
      if (!this.tiles[i]) {
        const position = {
          x: i % this.numColumns,
          y: Math.floor(i / this.numColumns),
        };
        const aboveTileIndex = this.getFirstAboveTileIndex(position);
        if (aboveTileIndex !== -1) {
          this.tiles[i] = this.tiles[aboveTileIndex];
          this.tiles[aboveTileIndex] = null;
          this.tiles[i].position = position;
        }
      }
    }
  }

  private fillGroup(group: TileGroupModel, tile: TileModel): void {
    const stack: TileModel[] = [tile];
    while (stack.length > 0) {
      const currentTile = stack.pop();
      if (this.addTileToGroup(currentTile, group)) {
        const neighbors = this.getNeighbors(currentTile);
        for (const neighbor of neighbors) {
          if (!neighbor.group && neighbor.type === currentTile.type) {
            stack.push(neighbor);
          }
        }
      }
    }
  }

  private addTileToGroup(tile: TileModel, group: TileGroupModel): boolean {
    if (!tile.group) {
      group.type ??= tile.type;
      if (group.type === tile.type) {
        group.addTile(tile);
        tile.group = group;
        return true;
      }
    }
    return false;
  }

  private getNeighbors(tile: TileModel): TileModel[] {
    const neighbors: TileModel[] = [];
    const directions = [
      { x: 0, y: 1 }, // Up
      { x: 1, y: 0 }, // Right
      { x: 0, y: -1 }, // Down
      { x: -1, y: 0 }, // Left
    ];

    for (const dir of directions) {
      const neighbor = this.getTileAt(
        tile.position.y + dir.y,
        tile.position.x + dir.x
      );
      if (neighbor) {
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  }

  private getFirstAboveTileIndex(position: Point): number {
    for (let row = position.y - 1; row >= 0; row--) {
      const aboveTileIndex = this.getTileIndexAt(row, position.x);
      if (aboveTileIndex !== -1 && this.tiles[aboveTileIndex]) {
        return aboveTileIndex;
      }
    }
    return -1;
  }

  private getTileIndexAt(row: number, col: number): number {
    if (row < 0 || row >= this.numRows || col < 0 || col >= this.numColumns) {
      return -1;
    }
    return row * this.numColumns + col;
  }
}
