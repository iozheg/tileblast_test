import { delay } from "./Utils";

export default class EffectProcessor<TData> {
  private lastCommitId = 1;
  private effectsRunning = 0;

  constructor(
    private effectHandler: (effect: TileEffect<TData>) => Promise<void>,
    private completeHandler: () => void
  ) {}

  public addEffect(delay: number, data?: TData): TileEffect<TData> {
    const commitId = this.lastCommitId++;
    const effect: TileEffect<TData> = { delay, commitId, data };
    this.processEffect(effect);
    return effect;
  }

  private async processEffect(effect: TileEffect<TData>) {
    this.effectsRunning++;
    await delay(effect.delay);
    await this.effectHandler(effect);
    this.effectsRunning--;

    if (this.effectsRunning === 0) {
      this.lastCommitId = 1;
      this.completeHandler();
    }
  }
}

export type TileEffect<TData> = {
  delay: number;
  commitId: number;
  data?: TData;
};
