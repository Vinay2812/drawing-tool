import * as PIXI from "pixi.js";
export const windowWidth = window.innerWidth;
export const windowHeight = window.innerHeight;
// export const GRID_UNIT = Math.min(windowHeight / 6, 100);
export const GRID_UNIT = 50;
export const LINE_WIDTH = 5;

const isMobile = () => {
    return windowWidth < windowHeight;
};

export const textGraphicsOptions: Partial<PIXI.ITextStyle> | PIXI.TextStyle = {
    fontSize:
        Math.sqrt(GRID_UNIT + LINE_WIDTH) / (isMobile() ? 0.7 : 2) +
        ((35 - 20) * (windowWidth - 320)) / (1920 - 320),
    fontWeight: "500",
    fill: "#000000",
    padding: 20
};
