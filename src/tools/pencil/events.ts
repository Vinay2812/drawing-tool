import { PointerEventsProps } from "../../components/canvas";
import { DrawingItem } from "../../components/drawing-tool";
import { getPointerPosition } from "../utils/calculations";
import { renderPencilGraphics } from "./renderers";

export function onDown(e: MouseEvent, others: PointerEventsProps) {
    const { setIsDrawing, pencilPointsRef, container, viewport } = others;
    pencilPointsRef.current = [getPointerPosition(e, container, viewport)];
    setIsDrawing(true);
}

export function onMove(e: MouseEvent, others: PointerEventsProps) {
    const {
        container,
        isDrawing,
        pencilPointsRef,
        shapes,
        viewport,
        graphicsStoreRef,
    } = others;
    if (!isDrawing || !pencilPointsRef.current.length) return;
    const point = getPointerPosition(e, container, viewport);
    pencilPointsRef.current.push(point);
    const shapeId = (shapes["pencil"]?.length ?? 0) + 1;
    renderPencilGraphics(
        {
            points: pencilPointsRef.current,
            shapeId,
        },
        viewport,
        graphicsStoreRef,
    );
}

export function onUp(e: MouseEvent, others: PointerEventsProps) {
    const {
        setIsDrawing,
        pencilPointsRef,
        container,
        shapes,
        setDrawingItems,
        isDrawing,
        viewport,
    } = others;
    if (!isDrawing || !pencilPointsRef.current.length) {
        pencilPointsRef.current = [];
        return;
    }
    const point = getPointerPosition(e, container, viewport);
    const shapeId = (shapes["pencil"]?.length ?? 0) + 1;
    setDrawingItems((prev) => {
        const pencil: DrawingItem = {
            id: prev.length + 1,
            type: "pencil",
            data: {
                points: [...pencilPointsRef.current, point],
                shapeId: shapeId,
            },
        };
        return [...prev, pencil];
    });
    setIsDrawing(false);
}
