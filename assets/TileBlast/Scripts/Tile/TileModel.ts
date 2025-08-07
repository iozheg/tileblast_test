import TileGroupModel from "./TileGroupModel";

export default class TileModel {
  readonly id: number;

  position: cc.Vec2;

  type: string;

  group: TileGroupModel | null = null;

  constructor(id: number, row: number, col: number, type: string) {
    this.id = id;
    this.position = new cc.Vec2(col, row);
    this.type = type;
  }
}
