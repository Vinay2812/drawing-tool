import { PointerEventsProps } from "../../components/Canvas";
import { Pencil } from "../../components/DrawingArea";
import { getPointerPosition } from "../utils/calculations";

export function onDown(e: MouseEvent, others: PointerEventsProps) {
    const { setIsDrawing, setDrawingItems } = others;
    setDrawingItems((prev) => {
        return [
            ...prev,
            {
                type: "pencil",
                data: {
                    points: [getPointerPosition(e, others.container)],
                } as Pencil,
                id: prev.length + 1,
            },
        ];
    });
    setIsDrawing(true);
}

export function onMove(e: MouseEvent, others: PointerEventsProps) {
    const { container } = others;
    const point = getPointerPosition(e, container);
    console.log(point)
}

export function onUp(e: MouseEvent, others: PointerEventsProps) {
    const { setIsDrawing } = others;
    setIsDrawing(false);
}
