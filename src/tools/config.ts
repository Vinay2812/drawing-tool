import * as PIXI from "pixi.js";
export const GRID_UNIT = Math.min(80, window.innerWidth / 8);

export const textGraphicsOptions: Partial<PIXI.ITextStyle> | PIXI.TextStyle = {
    fontSize: 16,
    fill: "white",
    fontWeight: "500",
};
