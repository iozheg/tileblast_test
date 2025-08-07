import { Point } from "../utils/Point";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileView extends cc.Component {
  @property(cc.Label)
  private groupIdLabel: cc.Label = null;

  @property(cc.Sprite)
  private sprite: cc.Sprite = null;

  private tween: cc.Tween | null = null;

  setup(sprite: cc.SpriteFrame, groupId: number): void {
    this.sprite.spriteFrame = sprite;
    this.groupIdLabel.string = `${groupId}`;
    this.node.scale = 1;
  }

  moveTo(position: Point): void {
    if (this.tween) {
      this.tween.stop();
      this.tween = null;
    }
    this.tween = cc
      .tween(this.node)
      .to(0.2, { position: cc.v2(position.x, position.y) })
      .call(() => {
        this.tween = null;
      })
      .start();
  }

  async remove(): Promise<void> {
    return new Promise((resolve) => {
      cc.tween(this.node)
        .to(0.2, { scale: 0 })
        .call(() => {
          resolve();
        })
        .start();
    });
  }

  //debug
  setDebugInfo(id: number, groupId: number): void {
    this.groupIdLabel.string = `${id}(${groupId})`;
  }
}
