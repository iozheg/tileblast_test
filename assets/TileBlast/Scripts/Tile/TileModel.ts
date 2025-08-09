import { Point } from "../utils/Point";
import TypedTile from "./TypedTile";

export default class TileModel implements TypedTile {
  id: string;

  type: string;

  behaviour: string = "normal";

  position: Point;

  group: string;
}
