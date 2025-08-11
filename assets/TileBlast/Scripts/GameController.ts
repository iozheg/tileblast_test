import BoardController, { BoardControllerEvent } from "./Board/BoardController";
import DialogController from "./Dialogs/DialogController";
import ProgressControllerBase, {
  ProgressControllerEvent,
} from "./GameProgress/ProgressControllerBase";

import TypedTile from "./Tile/TypedTile";
import { delay } from "./utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component {
  @property(BoardController)
  boardController: BoardController = null;

  @property(ProgressControllerBase)
  gameProgress: ProgressControllerBase = null;

  @property(DialogController)
  dialogController: DialogController = null;

  private gameOverDelay = 1000;

  start() {
    this.boardController.node.on(
      BoardControllerEvent.MOVE_PERFORMED,
      this.onMovePerformed,
      this
    );
    this.boardController.node.on(
      BoardControllerEvent.TILES_REMOVED,
      this.onTilesRemoved,
      this
    );
    this.boardController.node.on(
      BoardControllerEvent.NO_MOVES_LEFT,
      this.onNoMovesLeft,
      this
    );

    this.gameProgress.node.on(
      ProgressControllerEvent.GOAL_REACHED,
      this.onGoalReached,
      this
    );

    this.gameProgress.node.on(
      ProgressControllerEvent.FAILED,
      this.onNoMovesLeft,
      this
    );

    this.dialogController.node.on("retry", this.retry, this);

    this.boardController.init();
  }

  destroy(): boolean {
    this.boardController.node.off(
      BoardControllerEvent.TILES_REMOVED,
      this.onTilesRemoved,
      this
    );

    this.gameProgress.node.off(
      ProgressControllerEvent.GOAL_REACHED,
      this.onGoalReached,
      this
    );

    this.gameProgress.node.off(
      ProgressControllerEvent.FAILED,
      this.onNoMovesLeft,
      this
    );

    this.dialogController.node.off("retry", this.retry, this);

    return super.destroy();
  }

  // update (dt) {}

  private onMovePerformed(): void {
    this.gameProgress.onMovePerformed();
  }

  private onTilesRemoved(tileModels: TypedTile[]): void {
    this.gameProgress.onTilesRemoved(tileModels);
  }

  private onGoalReached(): void {
    delay(this.gameOverDelay).then(() => {
      this.dialogController.showSuccessDialog();
    });
  }

  private onNoMovesLeft(): void {
    delay(this.gameOverDelay).then(() => {
      this.dialogController.showFailureDialog();
    });
  }

  private retry() {
    this.gameProgress.reset();
    this.boardController.init();
  }
}
