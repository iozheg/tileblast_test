const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
  @property(cc.Label)
  private groupIdLabel: cc.Label = null;

  @property(cc.Sprite)
  private tile: cc.Sprite = null;

  private id: number = 0;

  setup(id: number, sprite: cc.SpriteFrame, groupId: number): void {
    this.id = id;
    this.tile.spriteFrame = sprite;
    this.groupIdLabel.string = `${groupId}`;
  }

  setSizeAndPosition(position: Point, size: Point): void {
    this.node.setPosition(position.x, position.y);
    this.node.setContentSize(size.x, size.y);
  }
}

type Point = {
  x: number;
  y: number;
};
