const { ccclass, property } = cc._decorator;

@ccclass("TileType")
export default class TileType {
  @property()
  type: string = "";

  @property(cc.SpriteFrame)
  sprite: cc.SpriteFrame = null;
}
