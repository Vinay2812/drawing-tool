import { PointerEventsProps } from "./../../components/Canvas";
import * as PIXI from "pixi.js";
import { GRID_UNIT } from "../utils/config";
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
import { SmoothGraphics } from "@pixi/graphics-smooth";
import { getAngleKey, getLineKey } from "../utils/keys";
import { Viewport } from "pixi-viewport";
import { renderCanvasGrid } from "../../components/renderGrid";

export function removeAngleGraphics(
    lines: Line[],
    removingLine: Line,
    viewport: Viewport,
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >,
) {
    for (const line of lines) {
        if (areSameLines(line, removingLine)) continue;
        const key1: string = getAngleKey(line, removingLine);
        const key2: string = getAngleKey(removingLine, line);
        graphicsStoreRef.current[key1]?.forEach((g) => viewport.removeChild(g));
        graphicsStoreRef.current[key2]?.forEach((g) => viewport.removeChild(g));
    }
}

export function removeLineGraphics(
    line: Line,
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >,
    viewport: Viewport,
) {
    const key = getLineKey(line);
    graphicsStoreRef.current[key]?.forEach((g) => viewport.removeChild(g));
}

export function onDown(e: MouseEvent, others: PointerEventsProps) {
    const {
        viewport,
        setStartPoint,
        container,
        setIsDrawing,
        setSelectedPoint,
        shapes,
    } = others;
    // setStartPoint(getPointerPosition(e, container, viewport));
    const lines = (shapes["line"] ?? []) as Line[];
    const clickedPoint = getPointerPosition(e, container, viewport);
    const points = getPointsFromLines(lines);
    const endPoint = getClosestPoint(clickedPoint, points, GRID_UNIT / 2);
    console.log("points", points, endPoint)
    // viewport.plugins.resume("drag");
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
            // console.log("clickedLine", clickedLine, fixedPoint);
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
        app,
        gridGraphics,
        setStartPoint,
    } = others;
    if (startPoint && !isDrawing) {
        // const { marginLeft = "0", marginTop = "0" } = container.style;
        // const currPos = getPointerPosition(e, container, viewport);
        // const deltaX = currPos.x - startPoint.x;
        // const deltaY = currPos.y - startPoint.y;
        // // Update the viewport's center position based on the drag
        // const scrollSpeed = 1; // Adjust as needed
        // const movementX = -deltaX * scrollSpeed; // Invert to simulate drag scroll
        // const movementY = -deltaY * scrollSpeed;
        // // viewport.moveCenter(
        // //     viewport.center.x + movementX,
        // //     viewport.center.y + movementY,
        // // );
        // container.style.marginLeft = `${parseFloat(marginLeft) + movementX}`;
        // container.style.marginTop = `${parseFloat(marginTop) + movementY}`;
        // app.screen.pad(movementX, movementX)
        // // renderCanvasGrid(viewport, app, gridGraphics)
        // // ... (Update viewport dimensions and position as needed)
        // // Update start drag positions for the next event
        // setStartPoint(currPos);
    }
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
            graphics,
            textGraphics,
        );
        const filteredLines = lines.filter(
            (line) => !areSameLines(line, removingLine),
        );
        removeAngleGraphics(lines, removingLine, viewport, graphicsStoreRef);
        removeLineGraphics(removingLine, graphicsStoreRef, viewport);
        renderAngleBetweenLines(
            [...filteredLines, newLine],
            viewport,
            graphicsStoreRef,
            pointNumberRef,
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
        const updatedEnd = getClosestPoint(end, filteredPoints, GRID_UNIT / 2);

        const newLine: Line = {
            start,
            end: updatedEnd,
            shapeId: removingLine.shapeId,
        };

        setStartPoint(null);
        setIsDrawing(false);
        removeAngleGraphics(lines, removingLine, viewport, graphicsStoreRef);
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
