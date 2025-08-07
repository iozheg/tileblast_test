import TileModel from "../Tile/TileModel";
import TileGroupModel from "../Tile/TileGroupModel";
import { Point } from "../utils/Point";
import PooledFactory from "../utils/PooledFactory";

export default class BoardModel {
  private grid: TileModel[] = [];
  private tileGroups: TileGroupModel[] = [];
  private tileTypes: string[] = [];
  private numColumns: number;
  private numRows: number;

  private tileModelFactory: PooledFactory<TileModel>;

  get fieldTiles(): TileModel[] {
    return this.grid;
  }

  constructor(numColumns: number, numRows: number, tileTypes: string[]) {
    this.numColumns = numColumns;
    this.numRows = numRows;
    this.tileTypes = tileTypes;

    this.tileModelFactory = new PooledFactory(TileModel, numColumns * numRows);

    this.generateGrid();
  }

  public getTileById(id: number): TileModel | null {
    return this.grid.find((tile) => tile && tile.id === id) || null;
  }

  public removeGroupTiles(group: TileGroupModel): void {
    for (let i = 0; i < this.grid.length; i++) {
      if (this.grid[i] && this.grid[i].group === group) {
        this.tileModelFactory.releaseInstance(this.grid[i]);
        this.grid[i] = null;
      }
    }

    this.updateTilesPosition();
    this.fillEmptyTiles();
    this.assignGroups();
  }

  private generateGrid(): void {
    this.grid = [];
    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numColumns; col++) {
        const tile = this.tileModelFactory.create();
        tile.id = this.grid.length;
        tile.init(row, col, this.getRandomTileType());
        this.grid.push(tile);
      }
    }

    this.assignGroups();
  }

  private assignGroups(): void {
    for (const tile of this.grid) {
      tile && (tile.group = null);
    }
    this.tileGroups = [];

    for (const tile of this.grid) {
      if (tile && !tile.group) {
        const group = new TileGroupModel(this.tileGroups.length);
        this.tileGroups.push(group);
        this.fillGroup(group, tile);
      }
    }
  }

  private updateTilesPosition(): void {
    for (let i = this.grid.length - 1; i >= 0; i--) {
      if (!this.grid[i]) {
        const position = {
          x: i % this.numColumns,
          y: Math.floor(i / this.numColumns),
        };
        const aboveTileIndex = this.getFirstAboveTileIndex(position);
        if (aboveTileIndex !== -1) {
          this.grid[i] = this.grid[aboveTileIndex];
          this.grid[aboveTileIndex] = null;
          this.grid[i].position = position;
        }
      }
    }
  }

  private fillEmptyTiles(): void {
    for (let i = 0; i < this.grid.length; i++) {
      if (!this.grid[i]) {
        this.grid[i] = this.tileModelFactory.create();
        const position = {
          x: i % this.numColumns,
          y: Math.floor(i / this.numColumns),
        };

        this.grid[i].init(position.y, position.x, this.getRandomTileType());
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
      if (aboveTileIndex !== -1 && this.grid[aboveTileIndex]) {
        return aboveTileIndex;
      }
    }
    return -1;
  }

  private getTileAt(row: number, col: number): TileModel | null {
    const index = this.getTileIndexAt(row, col);
    return index !== -1 ? this.grid[index] : null;
  }

  private getTileIndexAt(row: number, col: number): number {
    if (row < 0 || row >= this.numRows || col < 0 || col >= this.numColumns) {
      return -1;
    }
    return row * this.numColumns + col;
  }

  private getRandomTileType(): string {
    return this.tileTypes[Math.floor(Math.random() * this.tileTypes.length)];
  }
}
