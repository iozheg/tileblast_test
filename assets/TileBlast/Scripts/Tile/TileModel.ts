import { Point } from "../utils/Point";
import TileGroupModel from "./TileGroupModel";

export default class TileModel {
  id: number;

  position: Point;

  type: string;

  group: TileGroupModel | null = null;

  constructor() {}

  init(row: number, col: number, type: string): void {
    this.position = { x: col, y: row };
    this.type = type;
  }
}
