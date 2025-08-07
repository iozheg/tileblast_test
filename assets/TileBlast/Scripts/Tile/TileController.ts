import { Point } from "../utils/Point";
import TileModel from "./TileModel";
import TileView from "./TileView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileController extends cc.Component {
  @property(TileView)
  private tileView: TileView;

  tileId: number;

  setup(model: TileModel, sprite: cc.SpriteFrame): void {
    this.tileId = model.id;
    this.tileView.setup(sprite, model.group.id);
  }

  setSizeAndPosition(size: Point, position: Point): void {
    // this.node.setPosition(position.x, position.y);
    this.tileView.moveTo(position);
    this.node.setContentSize(size.x, size.y);
  }

  setPosition(position: Point): void {
    this.tileView.moveTo(position);
  }

  destroyTile(): void {
    this.node.destroy();
  }

  // debug
  setDebugInfo(id: number, groupId: number): void {
    this.tileView.setDebugInfo(id, groupId);
  }
}
