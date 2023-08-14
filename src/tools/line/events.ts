import * as PIXI from "pixi.js";
import { GRID_UNIT } from "../config";
import {
    DrawingItem,
    type Line,
    type Point,
} from "../../components/DrawingArea";
import {
    getClosestPoint,
    getMousePos,
    getPointsFromLines,
} from "./calculations";
import {
    renderAngleBetweenLines,
    renderLineWithMeasurements,
    renderNewLine,
} from "./renderers";

export type LineOnDownProps = {
    lines: Line[];
    container: HTMLElement;
    setStartPoint: (point: Point) => void;
    setIsDrawing: (val: boolean) => void;
    drawingItemRef: React.MutableRefObject<
        Record<string, (PIXI.Graphics | PIXI.Text)[]>
    >;
    pointNumberRef: React.MutableRefObject<number>;
};

export type LineOnMoveProps = {
    startPoint: Point | null;
    isDrawing: boolean;
    lines: Line[];
    container: HTMLElement;
    app: PIXI.Application<HTMLCanvasElement>;
    angleTextGraphics: PIXI.Text;
    textGraphics: PIXI.Text;
    graphics: PIXI.Graphics;
    drawingItemRef: React.MutableRefObject<
        Record<string, (PIXI.Graphics | PIXI.Text)[]>
    >;
    pointNumberRef: React.MutableRefObject<number>;
};

export type LineOnUpProps = {
    startPoint: Point | null;
    isDrawing: boolean;
    lines: Line[];
    container: HTMLElement;
    app: PIXI.Application<HTMLCanvasElement>;
    angleTextGraphics: PIXI.Text;
    textGraphics: PIXI.Text;
    graphics: PIXI.Graphics;
    setIsDrawing: (val: boolean) => void;
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
    drawingItemRef: React.MutableRefObject<
        Record<string, (PIXI.Graphics | PIXI.Text)[]>
    >;
    pointNumberRef: React.MutableRefObject<number>;
};

export function onDown(e: MouseEvent, others: LineOnDownProps) {
    const { lines, container, setStartPoint, setIsDrawing } = others;
    // const lines = itemsRef.current.map((item) => item.data);
    const points = getPointsFromLines(lines);
    const startPoint = getMousePos(e, container);
    const closestPoint = getClosestPoint(startPoint, points, GRID_UNIT);

    setStartPoint(closestPoint);
    setIsDrawing(true);
}

export function onMove(e: MouseEvent, others: LineOnMoveProps) {
    const {
        startPoint,
        isDrawing,
        lines,
        container,
        app,
        angleTextGraphics,
        textGraphics,
        graphics,
        drawingItemRef,
        pointNumberRef,
    } = others;
    if (!startPoint || !isDrawing) return;
    // const lines = itemsRef.current.map((item) => item.data);
    const end = getMousePos(e, container);
    const start = startPoint;
    graphics.clear();
    textGraphics.text = "";
    angleTextGraphics.text = "";
    renderLineWithMeasurements(
        { start, end },
        app,
        drawingItemRef,
        graphics,
        textGraphics,
    );
    renderAngleBetweenLines(
        [...lines, { start, end }],
        app,
        drawingItemRef,
        pointNumberRef,
        graphics,
        angleTextGraphics,
    );
    app.stage.addChild(textGraphics);
    app.stage.addChild(graphics);
}

export function onUp(e: MouseEvent, others: LineOnUpProps) {
    const {
        startPoint,
        isDrawing,
        lines,
        setIsDrawing,
        angleTextGraphics,
        textGraphics,
        graphics,
        setDrawingItems,
        app,
        container,
        drawingItemRef,
        setStartPoint,
        pointNumberRef,
    } = others;
    if (!startPoint || !isDrawing) return;
    graphics.clear();
    app.stage.removeChild(textGraphics);
    app.stage.removeChild(angleTextGraphics);

    textGraphics.text = "";
    angleTextGraphics.text = "";
    const start = startPoint;
    const end = getMousePos(e, container);
    // const lines = itemsRef.current.map((item) => item.data);
    const points = getPointsFromLines(lines);
    const updatedStart = getClosestPoint(start, points, GRID_UNIT);
    const updatedEnd = getClosestPoint(end, points, GRID_UNIT);

    renderNewLine(updatedStart, updatedEnd, setDrawingItems);
    renderAngleBetweenLines(
        [...lines, { start: updatedStart, end: updatedEnd }],
        app,
        drawingItemRef,
        pointNumberRef,
        graphics,
        angleTextGraphics,
    );
    setStartPoint(null);
    setIsDrawing(false);
}
