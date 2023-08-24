import { GRID_UNIT } from "../utils/config";
import {
    getClosestPoint,
    getDistance,
    getLineFromLines,
    getPointerPosition,
    getPointsFromLines,
    roundupNumber,
} from "../utils/calculations";
import {
    renderLineGraphics,
    renderNewLine,
    renderAngleBetweenLines,
} from "./renderers";
import { PointerEventsProps } from "../../components/Canvas";
import { Line } from "../../components/DrawingArea";

export function onDown(e: MouseEvent, others: PointerEventsProps) {
    const { viewport, setStartPoint, setIsDrawing, shapes, container } = others;
    const lines = shapes["line"] ?? [];
    const points = getPointsFromLines(lines as Line[]);
    const startPoint = getPointerPosition(e, container, viewport);
    const closestPoint = getClosestPoint(startPoint, points, GRID_UNIT / 2);

    setStartPoint(closestPoint);
    setIsDrawing(true);
}

export function onMove(e: MouseEvent, others: PointerEventsProps) {
    const {
        startPoint,
        isDrawing,
        angleTextGraphics,
        textGraphics,
        graphics,
        graphicsStoreRef,
        pointNumberRef,
        shapes,
        viewport,
        container,
    } = others;
    if (!startPoint || !isDrawing) return;
    // const lines = itemsRef.current.map((item) => item.data);
    const end = getPointerPosition(e, container, viewport);
    const start = startPoint;
    const lines = (shapes["line"] ?? []) as Line[];
    graphics.clear();
    textGraphics.text = "";
    angleTextGraphics.text = "";
    const line: Line = { start, end, shapeId: lines.length + 1 };
    const lineExist = getLineFromLines(line, lines);
    if (lineExist) return;
    renderLineGraphics(
        line,
        viewport,
        graphicsStoreRef,
        graphics,
        textGraphics,
    );
    renderAngleBetweenLines(
        [...lines, line],
        viewport,
        graphicsStoreRef,
        pointNumberRef,
    );
    viewport.addChild(textGraphics);
    viewport.addChild(graphics);
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
        setStartPoint,
        shapes,
        viewport,
        container,
    } = others;
    if (!startPoint || !isDrawing) {
        graphics.clear();
        viewport.removeChild(textGraphics);
        viewport.removeChild(angleTextGraphics);
        return;
    }
    graphics.clear();
    textGraphics.text = "";
    angleTextGraphics.text = "";

    const start = startPoint;
    const end = getPointerPosition(e, container, viewport);
    const lines = (shapes["line"] ?? []) as Line[];
    const points = getPointsFromLines(lines);
    const updatedStart = getClosestPoint(start, points, GRID_UNIT / 2);
    const updatedEnd = getClosestPoint(end, points, GRID_UNIT / 2);
    const line: Line = {
        start: updatedStart,
        end: updatedEnd,
        shapeId: lines.length + 1,
    };
    const lineExist = getLineFromLines(line, lines);
    const length = roundupNumber(
        getDistance(line.start, line.end) / GRID_UNIT,
        1,
    );
    if (!lineExist && length > 0.1) renderNewLine(line, setDrawingItems);
    setStartPoint(null);
    setIsDrawing(false);
}
