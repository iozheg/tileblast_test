import { Point } from "../utils/Point";
import TileGroupModel from "./TileGroupModel";

export default class TileModel {
  readonly id: number;

  position: Point;

  type: string;

  group: TileGroupModel | null = null;

  constructor(id: number, row: number, col: number, type: string) {
    this.id = id;
    this.position = { x: col, y: row };
    this.type = type;
  }
}
