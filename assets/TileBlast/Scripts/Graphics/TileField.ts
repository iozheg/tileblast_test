import Tile from "../Tile";
import TileType from "../TileType";
import TileController from "./TileController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileField extends cc.Component {
  @property(cc.Node)
  tileContainer: cc.Node = null;

  @property(cc.Node)
  background: cc.Node = null;

  @property(cc.Prefab)
  tilePrefab: cc.Prefab = null;

  @property(cc.Float)
  tileSize: number = 60;

  @property([TileType])
  private tileTypes: TileType[] = [];

  private tileObjects: TileController[] = [];

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {}

  protected onDestroy(): void {
    this.tileObjects.forEach((tile) => {
      tile.node.off(cc.Node.EventType.TOUCH_END, this.onTileClick, this);
    });
    this.tileObjects = [];
  }

  generateTiles(numColumns: number, numRows: number) {
    const tileSize = this.tileContainer.getContentSize().width / numColumns;
    this.tileObjects = [];
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numColumns; col++) {
        const tileNode = cc.instantiate(this.tilePrefab);
        tileNode.on(cc.Node.EventType.TOUCH_END, this.onTileClick, this);
        this.tileContainer.addChild(tileNode);

        const tileController = tileNode.getComponent(TileController);
        const xOffset = col - Math.floor(numColumns / 2);
        tileController.setSizeAndPosition(
          { x: xOffset * tileSize, y: -row * tileSize },
          { x: tileSize, y: tileSize }
        );
        this.tileObjects.push(tileController);
      }
    }

    this.tileContainer.setContentSize(
      numColumns * tileSize,
      numRows * tileSize
    );
  }

  drawTiles(tiles: Tile[]) {
    tiles.forEach((tile, index) => {
      this.tileObjects[index].setup(
        tile.id,
        this.tileTypes.find((type) => type.type === tile.type)?.sprite,
        tile.group.id
      );
    });
  }

  private onTileClick(event: cc.Event.EventTouch): void {
    const tileId = event.currentTarget.getComponent(TileController).tileId;
    this.node.emit("tile-clicked", tileId);
  }
}
