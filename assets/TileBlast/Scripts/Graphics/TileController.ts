const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
  @property(cc.Label)
  private groupIdLabel: cc.Label = null;

  @property(cc.Sprite)
  private tile: cc.Sprite = null;

  private _tileId: number = 0;

  get tileId(): number {
    return this._tileId;
  }

  start() {}

  setup(id: number, sprite: cc.SpriteFrame, groupId: number): void {
    this._tileId = id;
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
