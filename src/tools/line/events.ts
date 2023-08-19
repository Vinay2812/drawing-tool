import { GRID_UNIT } from "../utils/config";
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
import { PointerEventsProps } from "../../components/Canvas";
import { Line } from "../../components/DrawingArea";

export function onDown(e: MouseEvent, others: PointerEventsProps) {
    const { container, setStartPoint, setIsDrawing, shapes } = others;
    const lines = shapes["line"] ?? [];
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
        container,
        app,
        angleTextGraphics,
        textGraphics,
        graphics,
        graphicsStoreRef,
        pointNumberRef,
        shapes,
    } = others;
    if (!startPoint || !isDrawing) return;
    // const lines = itemsRef.current.map((item) => item.data);
    const end = getPointerPosition(e, container);
    const start = startPoint;
    const lines = shapes["line"] ?? [];
    graphics.clear();
    textGraphics.text = "";
    angleTextGraphics.text = "";
    renderLineWithMeasurements(
        { start, end, shapeId: lines.length + 1 },
        app,
        graphicsStoreRef,
        graphics,
        textGraphics,
    );
    renderAngleBetweenLines(
        [...lines, { start, end, shapeId: lines.length + 1 }],
        app,
        graphicsStoreRef,
        pointNumberRef,
    );
    app.stage.addChild(textGraphics);
    app.stage.addChild(graphics);
}

export function onUp(e: MouseEvent, others: PointerEventsProps) {
    const {
        startPoint,
        isDrawing,
        setIsDrawing,
        angleTextGraphics,
        textGraphics,
        graphics,
        setDrawingItems,
        container,
        setStartPoint,
        shapes,
    } = others;
    if (!startPoint || !isDrawing) return;
    graphics.clear();

    textGraphics.text = "";
    angleTextGraphics.text = "";

    const start = startPoint;
    const end = getPointerPosition(e, container);
    const lines = shapes["line"] ?? [];
    const points = getPointsFromLines(lines);
    const updatedStart = getClosestPoint(start, points, GRID_UNIT / 2);
    const updatedEnd = getClosestPoint(end, points, GRID_UNIT / 2);
    const line: Line = {
        start: updatedStart,
        end: updatedEnd,
        shapeId: lines.length + 1,
    };
    renderNewLine(line, setDrawingItems);
    setStartPoint(null);
    setIsDrawing(false);
}
