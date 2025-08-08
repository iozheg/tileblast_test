const { ccclass, property } = cc._decorator;

@ccclass
export default class DialogView extends cc.Component {
  @property
  dialogId: string = "";

  @property(cc.Button)
  private confirmButton: cc.Button = null;

  start() {
    this.confirmButton.node.on("click", this.onConfirmButtonClicked, this);
  }

  destroy(): boolean {
    this.confirmButton.node.off("click", this.onConfirmButtonClicked, this);
    return super.destroy();
  }

  private onConfirmButtonClicked() {
    this.node.emit("confirm");
  }
}
