import * as PIXI from "pixi.js";
import { GRID_UNIT } from "../config";
import {
    DrawingItem,
    type Line,
    type Point,
} from "../../components/DrawingArea";
import {
    getClosestPoint,
    getMousePos,
    getPointsFromLines,
    isSamePoint,
} from "../line/calculations";
import {
    renderAngleBetweenLines,
    renderLineWithMeasurements,
} from "../line/renderers";
import { areSameLines, isPointAppearingOnce } from "./calculations";
import { SmoothGraphics } from "@pixi/graphics-smooth";

export type SelectOnDownProps = {
    lines: Line[];
    container: HTMLElement;
    setSelectedPoint: (point: Point | null) => void;
    setStartPoint: (point: Point) => void;
    setIsDrawing: (val: boolean) => void;
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
    drawingItems: DrawingItem[];
    drawingItemRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >;
    app: PIXI.Application<HTMLCanvasElement>;
    pointNumberRef: React.MutableRefObject<number>;
};

export type SelectOnMoveProps = {
    startPoint: Point | null;
    isDrawing: boolean;
    lines: Line[];
    container: HTMLElement;
    app: PIXI.Application<HTMLCanvasElement>;
    angleTextGraphics: PIXI.Text;
    textGraphics: PIXI.Text;
    graphics: SmoothGraphics;
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
    setReset: React.Dispatch<React.SetStateAction<boolean>>;
    selectedPoint: Point | null;
    drawingItemRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >;
    drawingItems: DrawingItem[];
    pointNumberRef: React.MutableRefObject<number>;
};

export type SelectOnUpProps = {
    startPoint: Point | null;
    selectedPoint: Point | null;
    isDrawing: boolean;
    lines: Line[];
    container: HTMLElement;
    app: PIXI.Application<HTMLCanvasElement>;
    angleTextGraphics: PIXI.Text;
    textGraphics: PIXI.Text;
    graphics: SmoothGraphics;
    setIsDrawing: (val: boolean) => void;
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
    setReset: React.Dispatch<React.SetStateAction<boolean>>;
    drawingItemRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >;
    setStartPoint: (point: Point | null) => void;
    pointNumberRef: React.MutableRefObject<number>;
    drawingItems: DrawingItem[];
};

export function removeAngleGraphics(
    lines: Line[],
    startPoint: Point,
    removingLine: Line,
    app: PIXI.Application<HTMLCanvasElement>,
    drawingItemRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >,
) {
    for (const line of lines) {
        if (areSameLines(line, removingLine)) continue;
        if (isSamePoint(line.start, startPoint)) {
            const key1 = `${JSON.stringify(startPoint)}-${JSON.stringify(
                removingLine.end,
            )}-${JSON.stringify(line.end)}`;
            const key2 = `${JSON.stringify(startPoint)}-${JSON.stringify(
                line.end,
            )}-${JSON.stringify(removingLine.end)}`;

            drawingItemRef.current[key1]?.forEach((g) =>
                app.stage.removeChild(g),
            );
            drawingItemRef.current[key2]?.forEach((g) =>
                app.stage.removeChild(g),
            );
        } else if (isSamePoint(line.end, startPoint)) {
            const key1 = `${JSON.stringify(startPoint)}-${JSON.stringify(
                removingLine.end,
            )}-${JSON.stringify(line.start)}`;
            const key2 = `${JSON.stringify(startPoint)}-${JSON.stringify(
                line.start,
            )}-${JSON.stringify(removingLine.end)}`;

            drawingItemRef.current[key1]?.forEach((g) =>
                app.stage.removeChild(g),
            );
            drawingItemRef.current[key2]?.forEach((g) =>
                app.stage.removeChild(g),
            );
        }
    }
}

export function removeLineGraphics(
    line: Line,
    drawingItemRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >,
    app: PIXI.Application<HTMLCanvasElement>,
) {
    const key1 = `${JSON.stringify(line.end)}-${JSON.stringify(line.start)}`;
    const key2 = `${JSON.stringify(line.start)}-${JSON.stringify(line.end)}`;
    drawingItemRef.current[key1]?.forEach((g) => app.stage.removeChild(g));
    drawingItemRef.current[key2]?.forEach((g) => app.stage.removeChild(g));
}

export function onDown(e: MouseEvent, others: SelectOnDownProps) {
    const {
        lines,
        container,
        drawingItems,
        setStartPoint,
        setIsDrawing,
        setSelectedPoint,
        drawingItemRef,
        app,
    } = others;

    const clickedPoint = getMousePos(e, container);
    const points = getPointsFromLines(lines);
    const endPoint = getClosestPoint(clickedPoint, points, 10);

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
            console.log("clickedLine", clickedLine, fixedPoint);
        }
        setIsDrawing(true);
        return;
    }
    setIsDrawing(false);
}

export function onMove(e: MouseEvent, others: SelectOnMoveProps) {
    const {
        startPoint,
        isDrawing,
        lines,
        container,
        app,
        angleTextGraphics,
        textGraphics,
        graphics,
        selectedPoint,
        drawingItemRef,
        pointNumberRef,
    } = others;
    if (!startPoint || !isDrawing || !selectedPoint) return;
    const end = getMousePos(e, container);
    const start = startPoint;
    graphics.clear();
    textGraphics.text = "";
    angleTextGraphics.text = "";
    const removingLine = {
        start: start,
        end: selectedPoint,
    };

    // removeAngleGraphics(lines, start, removingLine, app, drawingItemRef);
    renderLineWithMeasurements(
        { start, end },
        app,
        drawingItemRef,
        graphics,
        textGraphics,
    );

    const filteredLines = lines.filter(
        (line) => !areSameLines(line, removingLine),
    );
    removeAngleGraphics(lines, start, removingLine, app, drawingItemRef);
    removeLineGraphics(removingLine, drawingItemRef, app);
    renderAngleBetweenLines(
        [...filteredLines, { start, end }],
        app,
        drawingItemRef,
        pointNumberRef,
        graphics,
        angleTextGraphics,
    );

    app.stage.addChild(textGraphics);
    app.stage.addChild(graphics);
}

export function onUp(e: MouseEvent, others: SelectOnUpProps) {
    const {
        startPoint,
        selectedPoint,
        isDrawing,
        lines,
        setIsDrawing,
        angleTextGraphics,
        textGraphics,
        graphics,
        setDrawingItems,
        app,
        container,
        setReset,
        drawingItemRef,
        setStartPoint,
        drawingItems,
    } = others;
    if (!startPoint || !isDrawing || !selectedPoint) return;
    graphics.clear();
    textGraphics.text = "";
    angleTextGraphics.text = "";
    const start = startPoint;
    const end = getMousePos(e, container);
    const removingLine = {
        start: start,
        end: selectedPoint,
    };
    const filteredLines = lines.filter(
        (line) => !areSameLines(line, removingLine),
    );
    const filteredPoints = getPointsFromLines(filteredLines);
    const updatedEnd = getClosestPoint(end, filteredPoints, GRID_UNIT / 2);

    const newLine = { start, end: updatedEnd };

    setStartPoint(null);
    setIsDrawing(false);
    removeAngleGraphics(lines, start, removingLine, app, drawingItemRef);
    let isNewLine = true;
    for (const line of lines) {
        if (
            !areSameLines(newLine, removingLine) &&
            areSameLines(line, newLine)
        ) {
            isNewLine = false;
            const pointLabelKey = JSON.stringify(start);
            drawingItemRef.current[pointLabelKey]?.forEach((g) =>
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
