import BoardModel from "./BoardModel";
import TileController from "../Tile/TileController";
import TileModel from "../Tile/TileModel";
import TileType from "../TileType";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoardController extends cc.Component {
  @property(cc.Integer)
  private numColumns: number = 8;

  @property(cc.Integer)
  private numRows: number = 7;

  @property(cc.Node)
  tileContainer: cc.Node = null;

  @property(cc.Prefab)
  tilePrefab: cc.Prefab = null;

  @property([TileType])
  private tileTypes: TileType[] = [];

  private BoardModel: BoardModel;

  private tileControllers: TileController[] = [];

  private modelToController: Map<TileModel, TileController> = new Map();

  start() {
    const types = this.tileTypes.map((type) => type.type);
    this.BoardModel = new BoardModel(this.numColumns, this.numRows, types);
    this.BoardModel.generateTiles();
    this.BoardModel.assignGroups();

    this.printFieldGrid();

    this.createTiles();
  }

  private createTiles(): void {
    this.tileControllers = [];
    const tileSize =
      this.tileContainer.getContentSize().width / this.numColumns;

    for (const tileModel of this.BoardModel.fieldTiles) {
      const tileController = this.createTile(tileModel, tileSize);
      this.tileContainer.addChild(tileController.node);
      this.tileControllers.push(tileController);
      this.modelToController.set(tileModel, tileController);
    }

    this.tileContainer.setContentSize(
      this.numColumns * tileSize,
      this.numRows * tileSize
    );
  }

  private createTile(tileModel: TileModel, tileSize: number): TileController {
    const tileNode = cc.instantiate(this.tilePrefab);
    tileNode.on(cc.Node.EventType.TOUCH_END, this.onTileClick, this);

    const tileController = tileNode.getComponent(TileController);
    const xOffset = tileModel.position.x - Math.floor(this.numColumns / 2);
    tileController.setSizeAndPosition(
      { x: tileSize, y: tileSize },
      { x: xOffset * tileSize, y: -tileModel.position.y * tileSize }
    );

    const spriteFrame = this.tileTypes.find(
      (type) => type.type === tileModel.type
    )?.sprite;

    tileController.setup(tileModel, spriteFrame);

    return tileController;
  }

  private onTileClick(touchEvent: cc.Event.EventTouch): void {
    const tileNode = touchEvent.currentTarget as cc.Node;
    const tileId = tileNode.getComponent(TileController).tileId;
    const tileModel = this.BoardModel.getTileById(tileId);
    if (tileModel?.group.tileCount > 1) {
      console.log(
        `Tile clicked: ID=${tileModel.id}, Type=${tileModel.type}, Group ID=${tileModel.group.id}`
      );
      const removedTiles = this.BoardModel.removeGroupTiles(tileModel.group);
      this.removeTiles(removedTiles);
    }
  }

  private removeTiles(tileModels: TileModel[]) {
    for (const model of tileModels) {
      const tileController = this.modelToController.get(model);
      if (tileController) {
        tileController.destroyTile();
      }
      this.modelToController.delete(model);
    }
  }

  /**
   * Prints the fieldTiles as a grid to the console, showing tile ID and group ID for each tile.
   */
  private printFieldGrid(): void {
    let output = "\nField Grid:";
    let styleArr: string[] = [];
    const pad = (val: string | number, len: number) =>
      String(val).padStart(len, " ");
    for (let row = 0; row < this.numRows; row++) {
      let rowStr = "";
      let rowStyles: string[] = [];
      for (let col = 0; col < this.numColumns; col++) {
        const tile = this.BoardModel.getTileAt(row, col);
        if (tile) {
          // const tileId = tile.id != null ? pad(tile.id, 2) : " -";
          // const groupId = tile.group ? pad(tile.group.id, 2) : " -";
          const color = tile.type || "gray";
          rowStr += `%c[${tile.position.x}:${tile.position.y}] `;
          rowStyles.push(
            `background:${color};color:gray;padding:1px 4px;border-radius:3px;font-family:monospace`
          );
        } else {
          rowStr += "%c[ - : - ] ";
          rowStyles.push(
            "background:gray;color:white;padding:1px 4px;border-radius:3px;font-family:monospace"
          );
        }
      }
      output += `\n${rowStr}`;
      styleArr = styleArr.concat(rowStyles);
    }

    output += "\nFormat: [TileID:GroupID] (background = type color)";

    console.log(output, ...styleArr);
  }
}
