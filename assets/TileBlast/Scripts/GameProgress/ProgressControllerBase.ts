import TypedTile from "../Tile/TypedTile";

const { ccclass } = cc._decorator;

@ccclass
export default abstract class ProgressControllerBase extends cc.Component {
  abstract reset(): void;
  abstract onMovePerformed(): void;
  abstract onTilesRemoved(tileModels: TypedTile[]): void;
}

export enum ProgressControllerEvent {
  GOAL_REACHED = "goal_reached",
  FAILED = "failed",
}
