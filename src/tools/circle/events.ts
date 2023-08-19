import { PointerEventsProps } from "../../components/Canvas";
import {
    getClosestPoint,
    getPointerPosition,
    getPointsFromLines,
} from "../utils/calculations";
import { GRID_UNIT } from "../utils/config";
import { renderCircleWithMeasurements } from "./renderer";

export function onDown(e: MouseEvent, others: PointerEventsProps) {
    const { container, setStartPoint, setIsDrawing, shapes } = others;
    const start = getPointerPosition(e, container);
    const lines = shapes["circle"] ?? [];
    const points = getPointsFromLines(lines);
    const closestPoint = getClosestPoint(start, points, GRID_UNIT / 2);
    setStartPoint(closestPoint);
    setIsDrawing(true);
}

export function onMove(e: MouseEvent, others: PointerEventsProps) {
    const {
        startPoint,
        isDrawing,
        container,
        app,
        graphicsStoreRef,
        textGraphics,
        graphics,
        shapes,
    } = others;
    if (!startPoint || !isDrawing) return;
    const end = getPointerPosition(e, container);
    graphics.clear();
    textGraphics.text = "";
    const shapeId = (shapes["circle"] ?? []).length + 1;
    renderCircleWithMeasurements(
        { start: startPoint, end, shapeId },
        app,
        graphicsStoreRef,
        graphics,
        textGraphics,
    );
    app.stage.addChild(textGraphics);
    app.stage.addChild(graphics);
}

export function onUp(e: MouseEvent, others: PointerEventsProps) {
    const {
        startPoint,
        isDrawing,
        setIsDrawing,
        textGraphics,
        graphics,
        container,
        setStartPoint,
        setDrawingItems,
        shapes,
    } = others;
    if (!startPoint || !isDrawing) return;
    graphics.clear();
    textGraphics.text = "";

    const start = startPoint;
    const end = getPointerPosition(e, container);
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
