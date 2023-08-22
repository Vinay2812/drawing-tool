import { PointerEventsProps } from "../../components/Canvas";
import { Circle } from "../../components/DrawingArea";
import {
    getClosestPoint,
    getPointerPosition,
    getPointsFromLines,
} from "../utils/calculations";
import { GRID_UNIT } from "../utils/config";
import { renderCircleWithMeasurements } from "./renderer";

export function onDown(e: MouseEvent, others: PointerEventsProps) {
    const { setStartPoint, setIsDrawing, shapes, viewport, container } = others;
    const start = getPointerPosition(e, container, viewport);
    const lines = shapes["circle"] ?? [];
    const points = getPointsFromLines(lines as Circle[]);
    const closestPoint = getClosestPoint(start, points, GRID_UNIT / 2);
    setStartPoint(closestPoint);
    setIsDrawing(true);
}

export function onMove(e: MouseEvent, others: PointerEventsProps) {
    const {
        startPoint,
        isDrawing,
        viewport,
        graphicsStoreRef,
        textGraphics,
        graphics,
        shapes,
        container,
    } = others;
    if (!startPoint || !isDrawing) return;
    const end = getPointerPosition(e, container, viewport);
    graphics.clear();
    textGraphics.text = "";
    const shapeId = (shapes["circle"] ?? []).length + 1;
    renderCircleWithMeasurements(
        { start: startPoint, end, shapeId },
        viewport,
        graphicsStoreRef,
        graphics,
        textGraphics,
    );
    viewport.addChild(textGraphics);
    viewport.addChild(graphics);
}

export function onUp(e: MouseEvent, others: PointerEventsProps) {
    const {
        startPoint,
        isDrawing,
        setIsDrawing,
        textGraphics,
        graphics,
        viewport,
        setStartPoint,
        setDrawingItems,
        shapes,
        container,
    } = others;
    if (!startPoint || !isDrawing) {
        graphics.clear();
        viewport.removeChild(textGraphics);
        return;
    }
    graphics.clear();
    textGraphics.text = "";

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
