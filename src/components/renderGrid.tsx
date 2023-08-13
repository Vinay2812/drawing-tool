import * as PIXI from "pixi.js";
import { GRID_UNIT, textGraphicsOptions } from "../tools/config";
import { renderLineWithMeasurements } from "../tools/line";

export function renderCanvasGrid(
    app: PIXI.Application<HTMLCanvasElement> | null,
) {
    if (!app) return;
    const gridGraphics = new PIXI.Graphics();
    const subGridGraphics = new PIXI.Graphics();
    app.stage.addChild(gridGraphics);
    app.stage.addChild(subGridGraphics);

    // Grid properties
    const gridSize = GRID_UNIT;
    const gridColor = 0xaaaaaa; // Grid line color
    const gridAlpha = 0.5; // Grid line opacity
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

    for (let x = 0; x < app.renderer.width; x += subGridSize) {
        gridGraphics.lineStyle(1, gridColor, subGridAlpha);
        gridGraphics.moveTo(x, 0);
        gridGraphics.lineTo(x, app.renderer.height);
    }

    for (let y = 0; y < app.renderer.height; y += subGridSize) {
        gridGraphics.lineStyle(1, gridColor, subGridAlpha);
        gridGraphics.moveTo(0, y);
        gridGraphics.lineTo(app.renderer.width, y);
    }
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

    const lineGraphics = new PIXI.Graphics();
    const textGraphics = new PIXI.Text("1 cm", textGraphicsOptions);
    renderLineWithMeasurements(line, app, lineGraphics, textGraphics);
    app!.stage.addChild(lineGraphics);
    app!.stage.addChild(textGraphics);
}
