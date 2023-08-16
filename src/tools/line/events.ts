import * as PIXI from "pixi.js";
import { GRID_UNIT } from "../utils/config";
import {
    DrawingItem,
    type Line,
    type Point,
} from "../../components/DrawingArea";
import {
    getClosestPoint,
    getPointerPosition,
    getPointsFromLines,
} from "../utils/calculations";
import {
    renderLineWithMeasurements,
    renderNewLine,
    renderAngleBetweenLines,
} from "./renderers";
import { SmoothGraphics } from "@pixi/graphics-smooth";

export type PointerEventsProps = {
    startPoint: Point | null;
    setStartPoint: (point: Point | null) => void;
    isDrawing: boolean;
    setIsDrawing: (val: boolean) => void;
    selectedPoint: Point | null;
    setSelectedPoint: (point: Point | null) => void;
    drawingItems: DrawingItem[];
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
    lines: Line[];
    container: HTMLElement;
    app: PIXI.Application<HTMLCanvasElement>;
    angleTextGraphics: PIXI.Text;
    textGraphics: PIXI.Text;
    graphics: SmoothGraphics;
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >;
    pointNumberRef: React.MutableRefObject<number>;
};

export function onDown(e: MouseEvent, others: PointerEventsProps) {
    const { lines, container, setStartPoint, setIsDrawing } = others;
    // const lines = itemsRef.current.map((item) => item.data);
    const points = getPointsFromLines(lines);
    const startPoint = getPointerPosition(e, container);
    const closestPoint = getClosestPoint(startPoint, points, GRID_UNIT / 2);

    setStartPoint(closestPoint);
    setIsDrawing(true);
}

export function onMove(e: MouseEvent, others: PointerEventsProps) {
    const {
        startPoint,
        isDrawing,
        lines,
        container,
        app,
        angleTextGraphics,
        textGraphics,
        graphics,
        graphicsStoreRef,
        pointNumberRef,
    } = others;
    if (!startPoint || !isDrawing) return;
    // const lines = itemsRef.current.map((item) => item.data);
    const end = getPointerPosition(e, container);
    const start = startPoint;
    graphics.clear();
    textGraphics.text = "";
    angleTextGraphics.text = "";
    renderLineWithMeasurements(
        { start, end },
        app,
        graphicsStoreRef,
        graphics,
        textGraphics,
    );
    renderAngleBetweenLines(
        [...lines, { start, end }],
        app,
        graphicsStoreRef,
        pointNumberRef,
        graphics,
        angleTextGraphics,
    );
    app.stage.addChild(textGraphics);
    app.stage.addChild(graphics);
}

export function onUp(e: MouseEvent, others: PointerEventsProps) {
    const {
        startPoint,
        isDrawing,
        lines,
        setIsDrawing,
        angleTextGraphics,
        textGraphics,
        graphics,
        setDrawingItems,
        container,
        setStartPoint,
    } = others;
    if (!startPoint || !isDrawing) return;
    graphics.clear();

    textGraphics.text = "";
    angleTextGraphics.text = "";
    const start = startPoint;
    const end = getPointerPosition(e, container);
    // const lines = itemsRef.current.map((item) => item.data);
    const points = getPointsFromLines(lines);
    const updatedStart = getClosestPoint(start, points, GRID_UNIT / 2);
    const updatedEnd = getClosestPoint(end, points, GRID_UNIT / 2);

    renderNewLine(updatedStart, updatedEnd, setDrawingItems);
    setStartPoint(null);
    setIsDrawing(false);
}
