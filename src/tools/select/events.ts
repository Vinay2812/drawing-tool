import { PointerEventsProps } from "./../../components/Canvas";
import * as PIXI from "pixi.js";
import { GRID_UNIT } from "../utils/config";
import { type Line, type Point } from "../../components/DrawingArea";
import {
    getClosestPoint,
    getPointerPosition,
    getPointsFromLines,
    isSamePoint,
    areSameLines,
    isPointAppearingOnce,
} from "../utils/calculations";
import {
    renderLineWithMeasurements,
    renderAngleBetweenLines,
} from "../line/renderers";
import { SmoothGraphics } from "@pixi/graphics-smooth";

export function removeAngleGraphics(
    lines: Line[],
    startPoint: Point,
    removingLine: Line,
    app: PIXI.Application<HTMLCanvasElement>,
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >,
) {
    for (const line of lines) {
        if (areSameLines(line, removingLine)) continue;
        if (isSamePoint(line.start, startPoint)) {
            const key1 = `angle-${JSON.stringify(startPoint)}-${JSON.stringify(
                removingLine.end,
            )}-${JSON.stringify(line.end)}`;
            const key2 = `angle-${JSON.stringify(startPoint)}-${JSON.stringify(
                line.end,
            )}-${JSON.stringify(removingLine.end)}`;

            graphicsStoreRef.current[key1]?.forEach((g) =>
                app.stage.removeChild(g),
            );
            graphicsStoreRef.current[key2]?.forEach((g) =>
                app.stage.removeChild(g),
            );
        } else if (isSamePoint(line.end, startPoint)) {
            const key1 = `angle-${JSON.stringify(startPoint)}-${JSON.stringify(
                removingLine.end,
            )}-${JSON.stringify(line.start)}`;
            const key2 = `angle-${JSON.stringify(startPoint)}-${JSON.stringify(
                line.start,
            )}-${JSON.stringify(removingLine.end)}`;

            graphicsStoreRef.current[key1]?.forEach((g) =>
                app.stage.removeChild(g),
            );
            graphicsStoreRef.current[key2]?.forEach((g) =>
                app.stage.removeChild(g),
            );
        }
    }
}

export function removeLineGraphics(
    line: Line,
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >,
    app: PIXI.Application<HTMLCanvasElement>,
) {
    const key1 = `line-${JSON.stringify(line.end)}-${JSON.stringify(
        line.start,
    )}`;
    const key2 = `line-${JSON.stringify(line.start)}-${JSON.stringify(
        line.end,
    )}`;
    graphicsStoreRef.current[key1]?.forEach((g) => app.stage.removeChild(g));
    graphicsStoreRef.current[key2]?.forEach((g) => app.stage.removeChild(g));
}

export function onDown(e: MouseEvent, others: PointerEventsProps) {
    const { container, setStartPoint, setIsDrawing, setSelectedPoint, shapes } =
        others;
    const lines = shapes["line"] ?? [];
    const clickedPoint = getPointerPosition(e, container);
    const points = getPointsFromLines(lines);
    const endPoint = getClosestPoint(clickedPoint, points, GRID_UNIT / 2);

    if (isPointAppearingOnce(endPoint, points)) {
        setSelectedPoint(endPoint);
        const clickedLine = lines.find(
            (item) =>
                isSamePoint(item.start, endPoint) ||
                isSamePoint(item.end, endPoint),
        );
        if (clickedLine) {
            const fixedPoint = isSamePoint(clickedLine.start, endPoint)
                ? clickedLine.end
                : clickedLine.start;
            setStartPoint(fixedPoint);
            // console.log("clickedLine", clickedLine, fixedPoint);
        }
        setIsDrawing(true);
        return;
    }
    setIsDrawing(false);
}

export function onMove(e: MouseEvent, others: PointerEventsProps) {
    const {
        startPoint,
        isDrawing,
        container,
        app,
        angleTextGraphics,
        textGraphics,
        graphics,
        selectedPoint,
        graphicsStoreRef,
        pointNumberRef,
        shapes,
    } = others;
    if (!startPoint || !isDrawing || !selectedPoint) return;
    const end = getPointerPosition(e, container);
    const start = startPoint;
    graphics.clear();
    textGraphics.text = "";
    angleTextGraphics.text = "";
    const removingLine = {
        start: start,
        end: selectedPoint,
    };

    // removeAngleGraphics(lines, start, removingLine, app, graphicsStoreRef);
    renderLineWithMeasurements(
        { start, end },
        app,
        graphicsStoreRef,
        graphics,
        textGraphics,
    );
    const lines = shapes["line"] ?? [];
    const filteredLines = lines.filter(
        (line) => !areSameLines(line, removingLine),
    );
    removeAngleGraphics(lines, start, removingLine, app, graphicsStoreRef);
    removeLineGraphics(removingLine, graphicsStoreRef, app);
    renderAngleBetweenLines(
        [...filteredLines, { start, end }],
        app,
        graphicsStoreRef,
        pointNumberRef,
    );

    app.stage.addChild(textGraphics);
    app.stage.addChild(graphics);
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
        app,
        container,
        graphicsStoreRef,
        setStartPoint,
        shapes,
    } = others;
    if (!startPoint || !isDrawing || !selectedPoint) return;
    graphics.clear();
    textGraphics.text = "";
    angleTextGraphics.text = "";
    const start = startPoint;
    const end = getPointerPosition(e, container);
    const removingLine = {
        start: start,
        end: selectedPoint,
    };
    const lines = shapes["line"] ?? [];
    const filteredLines = lines.filter(
        (line) => !areSameLines(line, removingLine),
    );
    const filteredPoints = getPointsFromLines(filteredLines);
    const updatedEnd = getClosestPoint(end, filteredPoints, GRID_UNIT / 2);

    const newLine = { start, end: updatedEnd };

    setStartPoint(null);
    setIsDrawing(false);
    removeAngleGraphics(lines, start, removingLine, app, graphicsStoreRef);
    let isNewLine = true;
    for (const line of lines) {
        if (
            !areSameLines(newLine, removingLine) &&
            areSameLines(line, newLine)
        ) {
            isNewLine = false;
            const pointLabelKey = JSON.stringify(start);
            graphicsStoreRef.current[pointLabelKey]?.forEach((g) =>
                app.stage.removeChild(g),
            );
            break;
        }
    }
    setDrawingItems((prev) => {
        const filteredLines = prev.filter(
            (item) => !areSameLines(item.data, removingLine),
        );
        if (isNewLine) {
            filteredLines.push({ type: "line", data: newLine });
        }
        return filteredLines;
    });
}
