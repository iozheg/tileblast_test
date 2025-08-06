import TileField from "./Graphics/TileField";
import Tile from "./Tile";
import TileGroup from "./TileGroup";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FieldManager extends cc.Component {
  @property(cc.Integer)
  private numColumns: number = 8;

  @property(cc.Integer)
  private numRows: number = 7;

  @property([cc.String])
  private types: string[] = ["red", "blue", "green", "yellow"];

  @property(TileField)
  private tileField: TileField = null;

  private fieldTiles: Tile[] = [];

  private tileGroups: TileGroup[] = [];

  start() {
    this.createField();
    this.assignGroups();
    this.printFieldGrid();

    this.tileField.generateTiles(this.numColumns, this.numRows);
    this.tileField.drawTiles(this.fieldTiles);
  }

  /**
   * Prints the fieldTiles as a grid to the console, showing tile ID and group ID for each tile.
   */
  private printFieldGrid(): void {
    let output = "\nField Grid:";
    let styleArr: string[] = [];
    const pad = (val: string | number, len: number) =>
      String(val).padStart(len, " ");
    for (let row = 0; row < this.numRows; row++) {
      let rowStr = "";
      let rowStyles: string[] = [];
      for (let col = 0; col < this.numColumns; col++) {
        const tile = this.getTileAt(row, col);
        if (tile) {
          // const tileId = tile.id != null ? pad(tile.id, 2) : " -";
          // const groupId = tile.group ? pad(tile.group.id, 2) : " -";
          const color = tile.type || "gray";
          rowStr += `%c[${tile.position.x}:${tile.position.y}] `;
          rowStyles.push(
            `background:${color};color:gray;padding:1px 4px;border-radius:3px;font-family:monospace`
          );
        } else {
          rowStr += "%c[ - : - ] ";
          rowStyles.push(
            "background:gray;color:white;padding:1px 4px;border-radius:3px;font-family:monospace"
          );
        }
      }
      output += `\n${rowStr}`;
      styleArr = styleArr.concat(rowStyles);
    }

    output += "\nFormat: [TileID:GroupID] (background = type color)";

    console.log(output, ...styleArr);
  }

  private createField(): void {
    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numColumns; col++) {
        const type = this.types[Math.floor(Math.random() * this.types.length)];
        const tile = new Tile(this.fieldTiles.length, row, col, type);
        this.fieldTiles.push(tile);
      }
    }
  }

  private assignGroups(): void {
    for (const tile of this.fieldTiles) {
      if (!tile.group) {
        const group = new TileGroup(this.tileGroups.length);
        this.tileGroups.push(group);
        this.fillGroup(group, tile);
      }
    }
  }

  private fillGroup(group: TileGroup, tile: Tile): void {
    const stack: Tile[] = [tile];
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

  private addTileToGroup(tile: Tile, group: TileGroup): boolean {
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

  private getNeighbors(tile: Tile): Tile[] {
    const neighbors: Tile[] = [];
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

  private getTileAt(row: number, col: number): Tile | null {
    if (row < 0 || row >= this.numRows || col < 0 || col >= this.numColumns) {
      return null;
    }
    const index = row * this.numColumns + col;
    return this.fieldTiles[index] || null;
  }
}
