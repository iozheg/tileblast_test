import BoardModel from "../Board/BoardModel";
import TileModel from "../Tile/TileModel";

type TileBehaviorFn = (tile: TileModel, board: BoardModel) => TileModel[];

export default class TileBehaviourService {
  private behaviours: Record<string, TileBehaviorFn> = {
    normal: (tile: TileModel, board: BoardModel) => {
      return board.tiles.filter((t) => t && t.group === tile.group);
    },
    [TileBehaviour.RowDestroyer]: (tile: TileModel, board: BoardModel) => {
      const affected: TileModel[] = [];
      for (let col = 0; col < board.width; col++) {
        const t = board.getTileAt(tile.position.y, col);
        if (t) affected.push(t);
      }
      return affected;
    },
    [TileBehaviour.ColumnDestroyer]: (tile: TileModel, board: BoardModel) => {
      const affected: TileModel[] = [];
      for (let row = 0; row < board.height; row++) {
        const t = board.getTileAt(row, tile.position.x);
        if (t) affected.push(t);
      }
      return affected;
    },
    [TileBehaviour.RegionDestroyer]: (tile: TileModel, board: BoardModel) => {
      const regionSize = 1;
      const affected: TileModel[] = [];
      const startX = Math.max(0, tile.position.x - regionSize);
      const startY = Math.max(0, tile.position.y - regionSize);
      const endX = Math.min(board.width - 1, tile.position.x + regionSize);
      const endY = Math.min(board.height - 1, tile.position.y + regionSize);

      for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
          const t = board.getTileAt(y, x);
          if (t) affected.push(t);
        }
      }
      return affected;
    },
    [TileBehaviour.FieldDestroyer]: (tile: TileModel, board: BoardModel) => {
      return [...board.tiles];
    },
  };

  public run(tile: TileModel, board: BoardModel): TileModel[] {
    const behaviour = this.behaviours[tile.behaviour || "normal"];
    if (behaviour) {
      return behaviour(tile, board);
    }
    return [];
  }

  public getBehaviour(removedTiles: TileModel[]): TileBehaviour | null {
    if (removedTiles.length >= 9) return TileBehaviour.FieldDestroyer;
    if (removedTiles.length >= 7) return TileBehaviour.RegionDestroyer;
    if (removedTiles.length >= 5)
      return Math.random() > 0.5
        ? TileBehaviour.ColumnDestroyer
        : TileBehaviour.RowDestroyer;

    return null;
  }
}

export enum TileBehaviour {
  RowDestroyer = "rowDestroyer",
  ColumnDestroyer = "columnDestroyer",
  RegionDestroyer = "regionDestroyer",
  FieldDestroyer = "fieldDestroyer",
}
