import DialogView from "./DialogView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DialogController extends cc.Component {
  @property(cc.Node)
  backdrop: cc.Node = null;

  @property(DialogView)
  successDialog: DialogView = null;

  @property(DialogView)
  failureDialog: DialogView = null;

  private dialogs: { [key: string]: DialogView } = {};

  start() {
    this.dialogs = {
      [this.successDialog.dialogId]: this.successDialog,
      [this.failureDialog.dialogId]: this.failureDialog,
    };
    this.successDialog.node.on("confirm", this.onRetry, this);
    this.failureDialog.node.on("confirm", this.onRetry, this);

    this.hideDialogs();
  }

  destroy(): boolean {
    this.successDialog.node.off("confirm", this.onRetry, this);
    this.failureDialog.node.off("confirm", this.onRetry, this);
    return super.destroy();
  }

  // update (dt) {}

  showSuccessDialog() {
    this.showDialog(this.successDialog.dialogId);
  }

  showFailureDialog() {
    this.showDialog(this.failureDialog.dialogId);
  }

  private showDialog(dialogId: string) {
    this.hideDialogs();

    this.backdrop.active = true;
    const dialog = this.dialogs[dialogId];
    if (dialog) {
      dialog.node.active = true;
    }
  }

  private hideDialogs() {
    this.backdrop.active = false;
    Object.values(this.dialogs).forEach(
      (dialog) => (dialog.node.active = false)
    );
  }

  private onRetry() {
    this.backdrop.active = false;
    this.successDialog.node.active = false;
    this.failureDialog.node.active = false;

    this.node.emit("retry");
  }
}
