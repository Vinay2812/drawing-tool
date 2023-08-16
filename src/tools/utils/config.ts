import * as PIXI from "pixi.js";
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;
export const GRID_UNIT = Math.min(windowWidth / 6, 120);
export const LINE_WIDTH = 5;

const isMobile = () => {
    return windowWidth < windowHeight;
};

export const textGraphicsOptions: Partial<PIXI.ITextStyle> | PIXI.TextStyle = {
    fontSize:
        Math.sqrt(GRID_UNIT + LINE_WIDTH) / (isMobile() ? 0.7 : 2) +
        ((35 - 20) * (windowWidth - 320)) / (1920 - 320),
    fontWeight: "500",
    fill: "#fff",
};
