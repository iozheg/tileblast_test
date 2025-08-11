import EffectControllerBase from "./EffectControllerBase";
import { delay } from "../utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ParticleController extends EffectControllerBase {
  private particleSystems: cc.ParticleSystem[] = [];
  private duration: number = 0;

  onLoad() {
    this.particleSystems = this.node.getComponentsInChildren(cc.ParticleSystem);
    this.duration = this.particleSystems.reduce((max, system) => {
      return Math.max(max, system.duration);
    }, 0);
  }

  public playEffect() {
    this.particleSystems.forEach((system) => {
      system.resetSystem();
    });

    delay(this.duration * 1000).then(() => {
      this.node.emit("finished");
    });
  }
}
