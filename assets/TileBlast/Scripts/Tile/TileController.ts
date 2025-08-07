import { Point } from "../utils/Point";
import TileModel from "./TileModel";
import TileView from "./TileView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileController extends cc.Component {
  @property(TileView)
  private tileView: TileView = null;

  tileId: number;

  private positionOffset: Point = { x: 0, y: 0 };

  setup(model: TileModel, sprite: cc.SpriteFrame): void {
    this.tileId = model.id;
    this.tileView.setup(sprite, model.group.id);
  }

  setSize(size: Point): void {
    this.node.setContentSize(size.x, size.y);
    this.positionOffset = {
      x: size.x / 2,
      y: size.y / 2,
    };
  }

  setPosition(position: Point, immediate: boolean = false): void {
    const scenePosition = {
      x: position.x * this.node.width + this.positionOffset.x,
      y: -position.y * this.node.height,
    };

    if (immediate) {
      this.node.setPosition(scenePosition.x, scenePosition.y);
    } else {
      this.tileView.moveTo(scenePosition);
    }
  }

  async destroyTile(): Promise<void> {
    await this.tileView.remove();
  }

  // debug
  setDebugInfo(id: number, groupId: number): void {
    this.tileView.setDebugInfo(id, groupId);
  }
}
