const { ccclass, property } = cc._decorator;

@ccclass
export default class TileView extends cc.Component {
  @property(cc.Label)
  private groupIdLabel: cc.Label = null;

  @property(cc.Sprite)
  private sprite: cc.Sprite = null;

  setup(sprite: cc.SpriteFrame, groupId: number): void {
    this.sprite.spriteFrame = sprite;
    this.groupIdLabel.string = `${groupId}`;
  }
}
