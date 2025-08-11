const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class EffectControllerBase extends cc.Component {
  public abstract playEffect(): void;
}
