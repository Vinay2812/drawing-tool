import * as PIXI from "pixi.js";
import {
    GRID_UNIT,
    LINE_WIDTH,
    textGraphicsOptions,
} from "../tools/utils/config";
import { getMidpoint } from "../tools/utils/calculations";
import { SmoothGraphics } from "@pixi/graphics-smooth";
import { renderPoint } from "../tools/line";
import { Viewport } from "pixi-viewport";
import { Line } from "./DrawingArea";

const textGraphics = new PIXI.Text("1 cm", textGraphicsOptions);
// textGraphics.resolution = 8;

export function renderCanvasGrid(
    viewport: Viewport | null,
    app: PIXI.Application<HTMLCanvasElement> | null,
    gridGraphics: SmoothGraphics,
    // showSubgrid = false,
) {
    if (!viewport || !app) return;
    gridGraphics.clear();
    viewport.removeChild(gridGraphics)
    // viewport.zIndex = 100;
    // // Grid properties
    const gridSize = GRID_UNIT;
    const gridColor = "black"; // Grid line color
    const gridAlpha = 0.8; // Grid line opacity

    // // const zoomFactor = Math.min(1.0, Math.max(viewport.scale.x, 0.1)); // Adjust as needed
    // const zoomFactor = viewport.scale.x;
    // // Calculate the effective grid size based on the zoom level
    // const effectiveGridSize = gridSize * zoomFactor;
    // // Draw the grid lines
    // // const height = app.renderer.height;
    // // const width = app.renderer.width;
    // const startX = viewport.corner.x;
    // const startY = viewport.corner.y;
    // const endX = viewport.screenWorldWidth
    // const endY = viewport.screenWorldHeight;
    // const width = app.renderer.width + startX;
    // const height = app.renderer.height + startY;
    // for (let x = startX; x < endX; x += effectiveGridSize) {
    //     gridGraphics.lineStyle(1, gridColor, gridAlpha);
    //     gridGraphics.moveTo(x, 0);
    //     gridGraphics.lineTo(x, height);
    // }

    // for (let y = startY; y < endY; y += effectiveGridSize) {
    //     gridGraphics.lineStyle(1, gridColor, gridAlpha);
    //     gridGraphics.moveTo(0, y);
    //     gridGraphics.lineTo(width, y);
    // }

    // Calculate the center of the viewport in world coordinates
    const viewportCenterX = viewport.center.x;
    const viewportCenterY = viewport.center.y;

    // Calculate the center of the screen in screen coordinates
    const screenCenterX = app.renderer.screen.width / 2;
    const screenCenterY = app.renderer.screen.height / 2;

    // Calculate the difference between viewport center and screen center in world coordinates
    const offsetX = viewportCenterX - screenCenterX;
    const offsetY = viewportCenterY - screenCenterY;

    // Calculate the effective grid size in screen space
    const effectiveGridSize = gridSize * viewport.scale.x;

    // Calculate the range of grid lines to render
    const startX = Math.floor((viewportCenterX - screenCenterX) / effectiveGridSize) * effectiveGridSize - offsetX;
    const startY = Math.floor((viewportCenterY - screenCenterY) / effectiveGridSize) * effectiveGridSize - offsetY;
    const endX = startX + app.renderer.screen.width + effectiveGridSize;
    const endY = startY + app.renderer.screen.height + effectiveGridSize;

    // Render vertical grid lines
    for (let x = startX; x < endX; x += effectiveGridSize) {
        gridGraphics.lineStyle(1, gridColor, gridAlpha);
        gridGraphics.moveTo(x, 0);
        gridGraphics.lineTo(x, app.renderer.screen.height);
    }

    // Render horizontal grid lines
    for (let y = startY; y < endY; y += effectiveGridSize) {
        gridGraphics.lineStyle(1, gridColor, gridAlpha);
        gridGraphics.moveTo(0, y);
        gridGraphics.lineTo(app.renderer.screen.width, y);
    }
    // if (showSubgrid) {
    //     const subGridSize = GRID_UNIT / 5;
    //     const subGridAlpha = 0.1;
    //     for (let x = 0; x < viewport.worldWidth; x += subGridSize) {
    //         gridGraphics.lineStyle(1, gridColor, subGridAlpha);
    //         gridGraphics.moveTo(x, 0);
    //         gridGraphics.lineTo(x, viewport.worldHeight);
    //     }

    //     for (let y = 0; y < viewport.worldHeight; y += subGridSize) {
    //         gridGraphics.lineStyle(1, gridColor, subGridAlpha);
    //         gridGraphics.moveTo(0, y);
    //         gridGraphics.lineTo(viewport.worldWidth, y);
    //     }
    // }
    const line: Line = {
        start: {
            x: effectiveGridSize,
            y: effectiveGridSize,
        },
        end: {
            x: 2 * effectiveGridSize,
            y: effectiveGridSize,
        },
        shapeId: -1,
    };

    if (viewport.scale.x === 1 && viewport.scale.y === 1) {
        renderGridUnit(viewport, app, line, gridGraphics);
    } else {
        app.stage.removeChild(textGraphics);
    }
}

export function renderGridUnit(
    viewport: Viewport,
    app: PIXI.Application<HTMLCanvasElement>,
    line: Line,
    lineGraphics: SmoothGraphics,
) {
    // const lineGraphics = new SmoothGraphics();
    app.stage.removeChild(textGraphics);
    const { start, end } = line;
    const zoomFactor = viewport.scale.x;
    lineGraphics.lineStyle(LINE_WIDTH * zoomFactor, "blue", 1);
    lineGraphics.moveTo(start.x, start.y);
    lineGraphics.lineTo(end.x, end.y);
    renderPoint(lineGraphics, start, 4 * zoomFactor, "blue");
    renderPoint(lineGraphics, end, 4 * zoomFactor, "blue");
    const midpoint = getMidpoint(line.start, line.end);
    textGraphics.x = midpoint.x - 15;
    textGraphics.y = midpoint.y + 10;
    app.stage.addChild(lineGraphics);
    app.stage.addChild(textGraphics);
    textGraphics.scale = new PIXI.Point(viewport.scale.x, viewport.scale.y);
    textGraphics.resolution = 4;
}
