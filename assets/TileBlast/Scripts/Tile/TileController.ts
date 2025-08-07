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
    this.node.setPosition(position.x, position.y);
    this.node.setContentSize(size.x, size.y);
  }

  destroyTile(): void {
    this.node.destroy();
  }
}

type Point = {
  x: number;
  y: number;
};
