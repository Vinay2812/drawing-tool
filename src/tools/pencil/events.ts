import { PointerEventsProps } from "../../components/Canvas";
import { DrawingItem } from "../../components/DrawingArea";
import { getPointerPosition } from "../utils/calculations";
import { renderPencilGraphics } from "./renderers";

export function onDown(e: MouseEvent, others: PointerEventsProps) {
    const { setIsDrawing, pencilPointsRef, container } = others;
    pencilPointsRef.current = [getPointerPosition(e, container)];
    setIsDrawing(true);
}

export function onMove(e: MouseEvent, others: PointerEventsProps) {
    const {
        container,
        isDrawing,
        pencilPointsRef,
        shapes,
        graphics,
        app,
        graphicsStoreRef,
    } = others;
    if (!isDrawing || !pencilPointsRef.current.length) return;
    const point = getPointerPosition(e, container);
    pencilPointsRef.current.push(point);
    const shapeId = (shapes["pencil"]?.length ?? 0) + 1;
    graphics.clear();
    renderPencilGraphics(
        {
            points: pencilPointsRef.current,
            shapeId,
        },
        app,
        graphicsStoreRef,
        graphics,
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
    } = others;
    if (!isDrawing || !pencilPointsRef.current.length) return;
    const point = getPointerPosition(e, container);
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
        return [
            ...prev,
            pencil,
        ];
    });
    setIsDrawing(false);
}
