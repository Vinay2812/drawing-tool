import { PointerEventsProps } from "../../components/canvas";
import { Circle } from "../../components/drawing-tool";
import {
    getClosestPoint,
    getPointerPosition,
    getPointsFromLines,
} from "../utils/calculations";
import { renderCircleWithMeasurements } from "./renderer";

export function onDown(e: MouseEvent, others: PointerEventsProps) {
    const {
        setStartPoint,
        setIsDrawing,
        shapes,
        viewport,
        container,
        canvasConfig,
    } = others;
    const start = getPointerPosition(e, container, viewport);
    const lines = shapes["circle"] ?? [];
    const points = getPointsFromLines(lines as Circle[]);
    const closestPoint = getClosestPoint(
        start,
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
        viewport,
        graphicsStoreRef,
        shapes,
        container,
        canvasConfig,
    } = others;
    if (!startPoint || !isDrawing) return;
    const end = getPointerPosition(e, container, viewport);
    const shapeId = (shapes["circle"] ?? []).length + 1;
    renderCircleWithMeasurements(
        { start: startPoint, end, shapeId },
        viewport,
        graphicsStoreRef,
        canvasConfig,
    );
}

export function onUp(e: MouseEvent, others: PointerEventsProps) {
    const {
        startPoint,
        isDrawing,
        setIsDrawing,
        viewport,
        setStartPoint,
        setDrawingItems,
        shapes,
        container,
    } = others;
    if (!startPoint || !isDrawing) {
        return;
    }

    const start = startPoint;
    const end = getPointerPosition(e, container, viewport);
    const shapeId = (shapes["circle"] ?? []).length + 1;
    setDrawingItems((prev) => [
        ...prev,
        {
            type: "circle",
            id: prev.length + 1,
            data: { start, end, shapeId },
        },
    ]);

    setStartPoint(null);
    setIsDrawing(false);
}
