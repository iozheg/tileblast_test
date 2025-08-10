import TypedTile from "../Tile/TypedTile";
import ProgressControllerBase, {
  ProgressControllerEvent,
} from "./ProgressControllerBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScoreProgressController extends ProgressControllerBase {
  @property(cc.Label)
  movesLabel: cc.Label = null;

  @property(cc.Label)
  scoreLabel: cc.Label = null;

  @property
  movesLimit: number = 10;

  @property
  scoreTarget: number = 100;

  private movesLeft: number = 0;
  private currentScore: number = 0;

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {
    this.movesLeft = this.movesLimit;
    this.updateView();
  }

  // update (dt) {}

  reset(): void {
    this.movesLeft = this.movesLimit;
    this.currentScore = 0;
    this.updateView();
  }

  // setup(movesLimit: number, scoreTarget: number): void {
  //   this.movesLimit = movesLimit;
  //   this.scoreTarget = scoreTarget;
  //   this.updateView();
  // }

  onTilesRemoved(tileModels: TypedTile[], isUserAction: boolean): void {
    isUserAction && this.movesLeft--;

    this.currentScore += tileModels.filter(
      ({ behaviour }) => !behaviour
    ).length;
    this.updateView();

    this.checkState();
  }

  private checkState() {
    if (this.currentScore >= this.scoreTarget) {
      this.node.emit(ProgressControllerEvent.GOAL_REACHED);
    } else if (this.movesLeft <= 0) {
      this.node.emit(ProgressControllerEvent.FAILED);
    }
  }

  private updateView(): void {
    this.updateMovesLabel();
    this.updateScoreLabel();
  }

  private updateMovesLabel(): void {
    this.movesLabel.string = this.movesLeft.toString();
  }

  private updateScoreLabel(): void {
    this.scoreLabel.string = `${this.currentScore}/${this.scoreTarget}`;
  }
}
