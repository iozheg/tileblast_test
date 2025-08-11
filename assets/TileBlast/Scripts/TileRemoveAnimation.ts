import ParticleController from "./ParticleController";
import { delay } from "./utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileRemoveAnimation extends ParticleController {
  @property(cc.SpriteFrame)
  circle: cc.SpriteFrame = null;

  @property(cc.SpriteFrame)
  star: cc.SpriteFrame = null;

  @property(cc.Integer)
  private numStars: number = 5;

  @property
  jumpHeight: number = 10;

  @property
  durationUp: number = 0.2;

  @property
  durationDown: number = 0.7;

  @property
  starScale: number = 1;

  @property(cc.Color)
  private starColor: cc.Color = new cc.Color(255, 215, 0);

  private center: cc.Node = null;
  private stars: cc.Node[] = [];

  onLoad() {
    this.center = new cc.Node();
    this.center.addComponent(cc.Sprite).spriteFrame = this.circle;
    this.node.addChild(this.center);

    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      const star = new cc.Node();
      star.addComponent(cc.Sprite).spriteFrame = this.star;
      star.color = this.starColor;
      this.node.addChild(star);
      this.stars.push(star);
    }
  }

  start() {}

  public launch() {
    this.center.setScale(1, 1, 1);
    cc.tween(this.center).to(0.3, { scale: 0 }, { easing: "quadIn" }).start();

    this.stars.forEach((star) => {
      this.animateStar(star);
    });

    delay(1000).then(() => {
      this.node.emit("finished");
    });
  }

  private animateStar(star: cc.Node) {
    star.setPosition(0, 0, 0);
    const startScale = cc.math.randomRange(
      this.starScale * 0.8,
      this.starScale * 1.2
    );
    star.setScale(startScale, startScale, 1);
    const startPos = star.position;
    star.color = this.starColor;
    star.opacity = this.starColor.a;

    const angle = cc.math.randomRange(150, 30);
    const rad = cc.misc.degreesToRadians(angle);
    const dir = new cc.Vec3(Math.cos(rad), Math.sin(rad), 0).normalize();

    const peakPos = startPos.add(dir.multiplyScalar(this.jumpHeight));
    const fallPos = peakPos.clone().add(cc.v3(0, -200, 0));

    const randomDelay = cc.math.randomRange(0, 200);

    cc.tween(star)
      .delay(randomDelay / 1000)
      .to(this.durationUp, { position: peakPos }, { easing: "quadOut" })
      .parallel(
        cc
          .tween(star)
          .to(this.durationDown, { position: fallPos }, { easing: "quadIn" }),
        cc
          .tween(star)
          .to(this.durationDown, { opacity: 0 }, { easing: "expoIn" })
      )
      .start();
  }
}
