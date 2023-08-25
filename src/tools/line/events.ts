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
import { PointerEventsProps } from "../../components/canvas";
import { Line } from "../../components/drawing-tool";

export function onDown(e: MouseEvent, others: PointerEventsProps) {
    const {
        viewport,
        setStartPoint,
        setIsDrawing,
        shapes,
        container,
        canvasConfig,
    } = others;
    const lines = shapes["line"] ?? [];
    const points = getPointsFromLines(lines as Line[]);
    const startPoint = getPointerPosition(e, container, viewport);
    const closestPoint = getClosestPoint(
        startPoint,
        points,
        canvasConfig.gridSize / 2,
    );

    setStartPoint(closestPoint);
    setIsDrawing(true);
}

export function onMove(e: MouseEvent, others: PointerEventsProps) {
    const {
        startPoint,
        isDrawing,
        graphicsStoreRef,
        pointNumberRef,
        shapes,
        viewport,
        container,
        canvasConfig,
    } = others;
    if (!startPoint || !isDrawing) return;

    const end = getPointerPosition(e, container, viewport);
    const start = startPoint;
    const lines = (shapes["line"] ?? []) as Line[];
    const line: Line = { start, end, shapeId: lines.length + 1 };
    const lineExist = getLineFromLines(line, lines);
    if (lineExist) return;
    renderLineGraphics(line, viewport, graphicsStoreRef, canvasConfig);
    renderAngleBetweenLines(
        [...lines, line],
        viewport,
        graphicsStoreRef,
        pointNumberRef,
        canvasConfig,
    );
}

export function onUp(e: MouseEvent, others: PointerEventsProps) {
    const {
        startPoint,
        isDrawing,
        setIsDrawing,
        setDrawingItems,
        setStartPoint,
        shapes,
        viewport,
        container,
        canvasConfig,
    } = others;
    if (!startPoint || !isDrawing) {
        return;
    }

    const start = startPoint;
    const end = getPointerPosition(e, container, viewport);
    const lines = (shapes["line"] ?? []) as Line[];
    const points = getPointsFromLines(lines);
    const updatedStart = getClosestPoint(
        start,
        points,
        canvasConfig.gridSize / 2,
    );
    const updatedEnd = getClosestPoint(end, points, canvasConfig.gridSize / 2);
    const line: Line = {
        start: updatedStart,
        end: updatedEnd,
        shapeId: lines.length + 1,
    };
    const lineExist = getLineFromLines(line, lines);
    const length = roundupNumber(
        getDistance(line.start, line.end) / canvasConfig.gridSize,
        1,
    );
    if (!lineExist && length > 0.1) renderNewLine(line, setDrawingItems);
    setStartPoint(null);
    setIsDrawing(false);
}
