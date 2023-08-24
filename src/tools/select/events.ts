import { PointerEventsProps } from "./../../components/Canvas";
import { type Line } from "../../components/DrawingArea";
import {
    getClosestPoint,
    getPointerPosition,
    getPointsFromLines,
    isSamePoint,
    areSameLines,
    isPointAppearingOnce,
    getLineFromLines,
} from "../utils/calculations";
import { renderLineGraphics, renderAngleBetweenLines } from "../line/renderers";


export function onDown(e: MouseEvent, others: PointerEventsProps) {
    const {
        viewport,
        setStartPoint,
        container,
        setIsDrawing,
        setSelectedPoint,
        shapes,
        canvasConfig
    } = others;
    const lines = (shapes["line"] ?? []) as Line[];
    const clickedPoint = getPointerPosition(e, container, viewport);
    const points = getPointsFromLines(lines);
    const endPoint = getClosestPoint(clickedPoint, points, canvasConfig.gridSize / 2);
    const isSinglePoint = isPointAppearingOnce(endPoint, points);
    if (isSinglePoint) {
        viewport.plugins.pause("drag");

        const clickedLine = lines.find(
            (item) =>
                isSamePoint(item.start, endPoint) ||
                isSamePoint(item.end, endPoint),
        );
        if (clickedLine) {
            const fixedPoint = isSamePoint(clickedLine.start, endPoint)
                ? clickedLine.end
                : clickedLine.start;
            setSelectedPoint(endPoint);
            setStartPoint(fixedPoint);
            setIsDrawing(true);
            return;
        }
    }
    setIsDrawing(false);
}

export function onMove(e: MouseEvent, others: PointerEventsProps) {
    const {
        startPoint,
        isDrawing,
        viewport,
        angleTextGraphics,
        textGraphics,
        graphics,
        selectedPoint,
        graphicsStoreRef,
        pointNumberRef,
        shapes,
        container,
        canvasConfig
    } = others;
    if (!startPoint || !isDrawing || !selectedPoint) {
        return;
    }
    const end = getPointerPosition(e, container, viewport);
    const start = startPoint;
    graphics.clear();
    textGraphics.text = "";
    angleTextGraphics.text = "";
    const lines = (shapes["line"] ?? []) as Line[];
    const selectedLine = {
        start: start,
        end: selectedPoint,
        shapeId: -1,
    };
    const removingLine = getLineFromLines(selectedLine, lines);
    if (removingLine) {
        const newLine: Line = { start, end, shapeId: removingLine.shapeId };
        renderLineGraphics(
            newLine,
            viewport,
            graphicsStoreRef,
            canvasConfig
        );
        const filteredLines = lines.filter(
            (line) => !areSameLines(line, removingLine),
        );
        renderAngleBetweenLines(
            [...filteredLines, newLine],
            viewport,
            graphicsStoreRef,
            pointNumberRef,
            canvasConfig
        );

        viewport.addChild(textGraphics);
        viewport.addChild(graphics);
    }
}

export function onUp(e: MouseEvent, others: PointerEventsProps) {
    const {
        startPoint,
        selectedPoint,
        isDrawing,
        setIsDrawing,
        angleTextGraphics,
        textGraphics,
        graphics,
        setDrawingItems,
        viewport,
        graphicsStoreRef,
        setStartPoint,
        shapes,
        container,
        canvasConfig
    } = others;
    if (!startPoint || !isDrawing || !selectedPoint) {
        return;
    }
    viewport.plugins.resume("drag");
    graphics.clear();
    textGraphics.text = "";
    angleTextGraphics.text = "";
    const start = startPoint;
    const end = getPointerPosition(e, container, viewport);
    const selectedLine = {
        start: start,
        end: selectedPoint,
        shapeId: -1,
    };
    const lines = (shapes["line"] ?? []) as Line[];
    const removingLine = getLineFromLines(selectedLine, lines);
    if (removingLine) {
        const filteredLines = lines.filter(
            (line) => !areSameLines(line, removingLine),
        );
        const filteredPoints = getPointsFromLines(filteredLines);
        const updatedEnd = getClosestPoint(end, filteredPoints, canvasConfig.gridSize / 2);

        const newLine: Line = {
            start,
            end: updatedEnd,
            shapeId: removingLine.shapeId,
        };

        setStartPoint(null);
        setIsDrawing(false);
        let isNewLine = true;
        for (const line of lines) {
            if (
                !areSameLines(newLine, removingLine) &&
                areSameLines(line, newLine)
            ) {
                isNewLine = false;
                const pointLabelKey = JSON.stringify(start);
                graphicsStoreRef.current[pointLabelKey]?.forEach((g) =>
                    viewport.removeChild(g),
                );
                break;
            }
        }
        setDrawingItems((prev) => {
            const filteredLines = prev.filter(
                (item) => !areSameLines(item.data as Line, removingLine),
            );
            if (isNewLine) {
                return [
                    ...filteredLines,
                    {
                        type: "line",
                        data: newLine,
                        id: filteredLines.length,
                    },
                ];
            }
            return [...filteredLines];
        });
    }
}
