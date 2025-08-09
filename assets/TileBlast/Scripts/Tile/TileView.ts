import { Point } from "../utils/Point";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileView extends cc.Component {
  @property(cc.Label)
  private groupIdLabel: cc.Label = null;

  @property(cc.Sprite)
  private sprite: cc.Sprite = null;

  @property(cc.Float)
  private moveSpeed: number = 1000;

  private direction = cc.v3(0, -1, 0);
  private targetPosition: cc.Vec3 | null = null;

  // service vectors
  private currentDistance: cc.Vec3 = cc.v3(0, 0, 0);
  private moveStep: cc.Vec3 = cc.v3(0, 0, 0);

  setup(sprite: cc.SpriteFrame): void {
    this.sprite.spriteFrame = sprite;
    this.node.scale = 1;
  }

  moveTo(position: Point): void {
    this.targetPosition = cc.v3(position.x, position.y, this.node.position.z);
    cc.Vec3.subtract(this.direction, this.targetPosition, this.node.position);
    this.direction.normalizeSelf();
  }

  update(dt: number): void {
    if (this.targetPosition) {
      const currentPos = this.node.position;
      cc.Vec3.subtract(this.currentDistance, this.targetPosition, currentPos);
      cc.Vec3.multiplyScalar(
        this.moveStep,
        this.direction,
        this.moveSpeed * dt
      );

      if (this.moveStep.magSqr() >= this.currentDistance.magSqr()) {
        this.node.setPosition(this.targetPosition);
        this.targetPosition = null;
      } else {
        const newPos = currentPos.clone().add(this.moveStep);
        this.node.setPosition(newPos);
      }
    }
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
}
