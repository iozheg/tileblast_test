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

  private isRemoving: boolean = false;

  // service vectors
  private currentDistance: cc.Vec3 = cc.v3(0, 0, 0);
  private moveStep: cc.Vec3 = cc.v3(0, 0, 0);

  setup(sprite: cc.SpriteFrame): void {
    this.sprite.spriteFrame = sprite;
    this.node.scale = 1;
  }

  moveTo(position: Point): void {
    if (
      !this.isRemoving &&
      (this.node.position.x !== position.x ||
        this.node.position.y !== position.y)
    ) {
      this.targetPosition = cc.v3(position.x, position.y, this.node.position.z);
      cc.Vec3.subtract(this.direction, this.targetPosition, this.node.position);
      this.direction.normalizeSelf();

      this.node.scaleY = 1.3;
    }
  }

  shake() {
    const startPosition = this.node.position.clone();
    const amplitude = 3;
    cc.tween(this.node)
      .by(0.05, { position: cc.v2(amplitude, 0) })
      .by(0.1, { position: cc.v2(-amplitude * 2, 0) })
      .by(0.1, { position: cc.v2(amplitude * 2, 0) })
      .by(0.1, { position: cc.v2(-amplitude * 2, 0) })
      .by(0.05, { position: cc.v2(amplitude, 0) })
      .to(0, { position: startPosition }) // reset position
      .start();
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
        this.node.scaleY = 1;
        this.playImpactAnimations();
      } else {
        const newPos = currentPos.clone().add(this.moveStep);
        this.node.setPosition(newPos);
      }
    }
  }

  async remove(): Promise<void> {
    this.isRemoving = true;
    this.targetPosition = null;
    return new Promise((resolve) => {
      cc.tween(this.node)
        .to(0.2, { scale: 0 })
        .call(() => {
          this.isRemoving = false;
          resolve();
        })
        .start();
    });
  }
  private playImpactAnimations(): void {
    const stepDuration = 0.1;
    const yScale = { y: 1 };

    cc.tween(yScale)
      .to(
        stepDuration,
        { y: 0.9 },
        {
          progress: (start, end, current: number, ratio) => {
            this.node.scaleY = current;
            return start + (end - start) * ratio;
          },
        }
      )
      .to(
        stepDuration,
        { y: 1 },
        {
          progress: (start, end, current: number, ratio) => {
            this.node.scaleY = current;
            return start + (end - start) * ratio;
          },
        }
      )
      .start();

    const startPosition = this.node.position.clone();
    const amplitude = 5;
    cc.tween(this.node)
      .by(
        stepDuration,
        { position: cc.v2(0, amplitude) },
        { easing: "backOut" }
      )
      .to(stepDuration, { position: startPosition }, { easing: "backOut" })
      .start();
  }
}
