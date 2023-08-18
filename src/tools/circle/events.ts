import { PointerEventsProps } from "../../components/Canvas";
import { getClosestPoint, getPointerPosition, getPointsFromLines } from "../utils/calculations";
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
    } = others;
    if (!startPoint || !isDrawing) return;
    const end = getPointerPosition(e, container);
    graphics.clear();
    textGraphics.text = "";
    renderCircleWithMeasurements(
        { start: startPoint, end },
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
    } = others;
    if (!startPoint || !isDrawing) return;
    graphics.clear();
    textGraphics.text = "";

    const start = startPoint;
    const end = getPointerPosition(e, container);

    setDrawingItems((prev) => [
        ...prev,
        {
            type: "circle",
            data: { start, end },
        },
    ]);

    setStartPoint(null);
    setIsDrawing(false);
}
