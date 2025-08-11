import TileModel from "../Tile/TileModel";
import TileModelFactory from "../Services/TileModelFactory";
import { Point } from "../utils/Point";

export default class BoardModel {
  private grid: TileModel[] = [];
  private tileTypes: string[] = [];
  private numColumns: number;
  private numRows: number;
  private tileFactory: TileModelFactory;

  get tiles(): TileModel[] {
    return this.grid;
  }

  get width(): number {
    return this.numColumns;
  }

  get height(): number {
    return this.numRows;
  }

  constructor(
    numColumns: number,
    numRows: number,
    tileTypes: string[],
    tileFactory: TileModelFactory
  ) {
    this.numColumns = numColumns;
    this.numRows = numRows;
    this.tileTypes = tileTypes;
    this.tileFactory = tileFactory;

    this.generateGrid();
  }

  public getTileById(id: string): TileModel | null {
    return this.grid.find((tile) => tile && tile.id === id) || null;
  }

  public getTileAt(row: number, col: number): TileModel | null {
    const index = this.getTileIndexAt(row, col);
    return index !== -1 ? this.grid[index] : null;
  }

  public setTileAt(position: Point, tile: TileModel): void {
    const index = this.getTileIndexAt(position.y, position.x);
    if (index !== -1) {
      this.grid[index] = tile;
    }
  }

  public stageRemoving(tileModels: TileModel[], commitId: number): void {
    for (const model of tileModels) {
      const index = this.getTileIndexAt(model.position.y, model.position.x);
      if (this.grid[index] && model.commitId === 0) {
        this.grid[index].commitId = commitId;
      }
    }
  }

  public commit(commitId: number): void {
    this.performRemove(commitId);
    this.shiftTilesDown();
    this.fillEmptyTiles(commitId);
    this.assignGroups();
  }

  public shuffleTiles(): void {
    this.grid = this.grid.sort(() => Math.random() - 0.5);
    this.grid.forEach((tile, index) => {
      tile.position = {
        x: index % this.numColumns,
        y: Math.floor(index / this.numColumns),
      };
    });
    this.assignGroups();
  }

  public clear() {
    this.grid = [];
  }

  private performRemove(commitId: number) {
    for (let i = this.grid.length - 1; i >= 0; i--) {
      const model = this.grid[i];
      if (model && model.commitId === commitId) {
        this.grid[i] = null;
      }
    }
  }

  private generateGrid(): void {
    this.grid = [];
    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numColumns; col++) {
        const tile = this.tileFactory.create({
          position: { x: col, y: row },
          type: this.getRandomTileType(),
        });
        this.grid.push(tile);
      }
    }

    this.assignGroups();
  }

  private shiftTilesDown(): void {
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

  private fillEmptyTiles(commitId: number): void {
    for (let i = 0; i < this.grid.length; i++) {
      if (!this.grid[i]) {
        this.grid[i] = this.tileFactory.create({
          position: {
            x: i % this.numColumns,
            y: Math.floor(i / this.numColumns),
          },
          type: this.getRandomTileType(),
        });
        this.grid[i].commitId = commitId;
      }
    }
  }

  private assignGroups(): void {
    for (const tile of this.grid) {
      tile && (tile.group = null);
    }

    let lastGroupId = 0;

    for (const tile of this.grid) {
      if (tile && !tile.group) {
        this.fillGroup(lastGroupId.toString(), tile);
        lastGroupId++;
      }
    }
  }

  private fillGroup(group: string, tile: TileModel): void {
    const type = tile.type;
    const stack: TileModel[] = [tile];
    while (stack.length > 0) {
      const currentTile = stack.pop();
      if (this.addTileToGroup(currentTile, group, type)) {
        const neighbors = this.getNeighbors(currentTile);
        for (const neighbor of neighbors) {
          if (!neighbor.group && neighbor.type === currentTile.type) {
            stack.push(neighbor);
          }
        }
      }
    }
  }

  private addTileToGroup(
    tile: TileModel,
    group: string,
    type: string
  ): boolean {
    if (!tile.group && type === tile.type) {
      tile.group = group;
      return true;
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
      if (aboveTileIndex !== -1 && this.grid[aboveTileIndex]?.commitId === 0) {
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

  private getRandomTileType(): string {
    return this.tileTypes[Math.floor(Math.random() * this.tileTypes.length)];
  }

  public gridConsoleView(label: string, commitId: number): void {
    let output = `%c[${label}]:\n`;
    const styles: string[] = [`color: ${colorMap[commitId % 6]}`];
    for (let row = 0; row < this.numRows; row++) {
      let rowStr = "";
      for (let col = 0; col < this.numColumns; col++) {
        const tile = this.getTileAt(row, col);
        let value: string;
        let style = "";
        if (tile && tile.behaviour) {
          value = " S ";
          style = `color: ${colorMap[tile.commitId % 6]}; font-weight: bold;`;
        } else if (tile) {
          value = ` ${tile.commitId}`.slice(-2).padStart(3, " ");
          style = `color: ${colorMap[tile.commitId % 6]};`;
        } else {
          value = "   ";
          style = "color: #fff;";
        }
        rowStr += `%c[${value}] `;
        styles.push(style);
      }
      output += rowStr.trim() + "\n";
    }
    console.log(output, ...styles);
  }
}

const colorMap: Record<number, string> = {
  0: "white",
  1: "green",
  2: "blue",
  3: "yellow",
  4: "purple",
  5: "orange",
};
