import * as PIXI from "pixi.js";
import { getMidpoint } from "../tools/utils/calculations";
import { SmoothGraphics } from "@pixi/graphics-smooth";
import { renderPoint } from "../tools/line";
import { Viewport } from "pixi-viewport";
import { Line } from "./DrawingArea";
import { CanvasConfig } from "./DrawingArea";
import { isMobile } from "../tools/utils/config";

let textGraphics: PIXI.Text | null = null;
// textGraphics.resolution = 8;

export function renderCanvasGrid(
    viewport: Viewport | null,
    app: PIXI.Application<HTMLCanvasElement> | null,
    gridGraphics: SmoothGraphics,
    config: CanvasConfig,
) {
    if (!viewport || !app) return;
    gridGraphics.clear();
    viewport.removeChild(gridGraphics);
    if (!textGraphics) {
        textGraphics = new PIXI.Text(`1 ${config.unit}`, config.textGraphicsOptions);
    }
    const gridSize = config.gridSize;
    const gridColor = "black"; // Grid line color
    const gridAlpha = 0.8; // Grid line opacity

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
    const startX =
        Math.floor((viewportCenterX - screenCenterX) / effectiveGridSize) *
            effectiveGridSize -
        offsetX;
    const startY =
        Math.floor((viewportCenterY - screenCenterY) / effectiveGridSize) *
            effectiveGridSize -
        offsetY;
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
    if (config.showSubGrid) {
        const subGridSize = effectiveGridSize / 5;
        const subGridAlpha = 0.1;
        for (let x = startX; x < endX; x += subGridSize) {
            gridGraphics.lineStyle(1, gridColor, subGridAlpha);
            gridGraphics.moveTo(x, 0);
            gridGraphics.lineTo(x, viewport.worldHeight);
        }

        for (let y = startY; y < endY; y += subGridSize) {
            gridGraphics.lineStyle(1, gridColor, subGridAlpha);
            gridGraphics.moveTo(0, y);
            gridGraphics.lineTo(viewport.worldWidth, y);
        }
    }
    // if (!initialX && !initialY) {
    const initialX = startX + (isMobile() ? 1 : 1) * effectiveGridSize;
    const initialY = startY + (isMobile() ? 1 : 1) * effectiveGridSize;
    // }
    const line: Line = {
        start: {
            x: initialX,
            y: initialY,
        },
        end: {
            x: initialX + effectiveGridSize,
            y: initialY,
        },
        shapeId: -1,
    };

    if (viewport.scale.x < 2 && viewport.scale.y < 2) {
        renderGridUnit(viewport, app, line, gridGraphics, config);
    } else {
        app.stage.removeChild(textGraphics);
    }
}

export function renderGridUnit(
    viewport: Viewport,
    app: PIXI.Application<HTMLCanvasElement>,
    line: Line,
    lineGraphics: SmoothGraphics,
    config: CanvasConfig,
) {
    // const lineGraphics = new SmoothGraphics();
    if (!textGraphics) {
        textGraphics = new PIXI.Text("1 cm", config.textGraphicsOptions);
    }
    app.stage.removeChild(textGraphics);
    const { start, end } = line;
    const zoomFactor = viewport.scale.x;
    lineGraphics.lineStyle(config.lineWidth * zoomFactor, "blue", 1);
    lineGraphics.moveTo(start.x, start.y);
    lineGraphics.lineTo(end.x, end.y);
    renderPoint(lineGraphics, start, 4 * zoomFactor, "blue");
    renderPoint(lineGraphics, end, 4 * zoomFactor, "blue");
    const midpoint = getMidpoint(line.start, line.end);
    const scale = viewport.scale.x;
    textGraphics.x = midpoint.x - 15 * scale;
    textGraphics.y = midpoint.y + 10 * scale;
    app.stage.addChild(lineGraphics);
    app.stage.addChild(textGraphics);
    textGraphics.scale = new PIXI.Point(viewport.scale.x, viewport.scale.y);
    textGraphics.resolution = 1 + viewport.scale.x;
}
