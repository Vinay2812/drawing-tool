import * as PIXI from "pixi.js";
import {
    GRID_UNIT,
    LINE_WIDTH,
    textGraphicsOptions,
} from "../tools/utils/config";
import { getMidpoint } from "../tools/utils/calculations";
import { SmoothGraphics } from "@pixi/graphics-smooth";
import { renderPoint } from "../tools/line";

export function renderCanvasGrid(
    app: PIXI.Application<HTMLCanvasElement> | null,
) {
    if (!app) return;
    const gridGraphics = new SmoothGraphics();
    const subGridGraphics = new SmoothGraphics();
    app.stage.addChild(gridGraphics);
    app.stage.addChild(subGridGraphics);

    // Grid properties
    const gridSize = GRID_UNIT;
    const gridColor = "black"; // Grid line color
    const gridAlpha = 0.8; // Grid line opacity
    const subGridSize = GRID_UNIT / 5;
    const subGridAlpha = 0.1;

    // Draw the grid lines
    for (let x = 0; x < app.renderer.width; x += gridSize) {
        gridGraphics.lineStyle(1, gridColor, gridAlpha);
        gridGraphics.moveTo(x, 0);
        gridGraphics.lineTo(x, app.renderer.height);
    }

    for (let y = 0; y < app.renderer.height; y += gridSize) {
        gridGraphics.lineStyle(1, gridColor, gridAlpha);
        gridGraphics.moveTo(0, y);
        gridGraphics.lineTo(app.renderer.width, y);
    }

    // for (let x = 0; x < app.renderer.width; x += subGridSize) {
    //     gridGraphics.lineStyle(1, gridColor, subGridAlpha);
    //     gridGraphics.moveTo(x, 0);
    //     gridGraphics.lineTo(x, app.renderer.height);
    // }

    // for (let y = 0; y < app.renderer.height; y += subGridSize) {
    //     gridGraphics.lineStyle(1, gridColor, subGridAlpha);
    //     gridGraphics.moveTo(0, y);
    //     gridGraphics.lineTo(app.renderer.width, y);
    // }
}

export function renderGridUnit(
    app: PIXI.Application<HTMLCanvasElement> | null,
) {
    if (!app) return;
    const line = {
        start: {
            x: GRID_UNIT,
            y: GRID_UNIT,
        },
        end: {
            x: 2 * GRID_UNIT,
            y: GRID_UNIT,
        },
    };

    const lineGraphics = new SmoothGraphics();
    const textGraphics = new PIXI.Text("1 cm", textGraphicsOptions);
    const { start, end } = line;
    lineGraphics.lineStyle(LINE_WIDTH, "blue", 1);

    lineGraphics.moveTo(start.x, start.y);
    lineGraphics.lineTo(end.x, end.y);
    renderPoint(lineGraphics, start, 4, "blue");
    renderPoint(lineGraphics, end, 4, "blue");
    const midpoint = getMidpoint(line.start, line.end);
    textGraphics.x = midpoint.x - 15;
    textGraphics.y = midpoint.y + 10;
    app.stage.addChild(lineGraphics);
    app.stage.addChild(textGraphics);
}
