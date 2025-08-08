import { Point } from "../utils/Point";
import TileGroupModel from "./TileGroupModel";
import TypedTile from "./TypedTile";

export default class TileModel implements TypedTile {
  private tileId: number = -1;

  position: Point;

  private tileType: string;

  get id(): number {
    return this.tileId;
  }

  set id(value: number) {
    this.tileId = this.tileId == -1 ? value : this.tileId;
  }

  get type(): string {
    return this.tileType;
  }

  group: TileGroupModel | null = null;

  constructor() {}

  init(row: number, col: number, type: string): void {
    this.position = { x: col, y: row };
    this.tileType = type;
  }
}
