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
    renderNewLine,
} from "../line/renderers";
import { isPointAppearingOnce } from "./calculations";

export type SelectOnDownProps = {
    lines: Line[];
    container: HTMLElement;
    setSelectedPoint: (point: Point | null) => void;
    setStartPoint: (point: Point) => void;
    setIsDrawing: (val: boolean) => void;
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
    drawingItems: DrawingItem[];
};

export type SelectOnMoveProps = {
    startPoint: Point | null;
    isDrawing: boolean;
    lines: Line[];
    container: HTMLElement;
    app: PIXI.Application<HTMLCanvasElement>;
    angleTextGraphics: PIXI.Text;
    textGraphics: PIXI.Text;
    graphics: PIXI.Graphics;
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
    setReset: React.Dispatch<React.SetStateAction<boolean>>;
    selectedPoint: Point | null;
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
    graphics: PIXI.Graphics;
    setIsDrawing: (val: boolean) => void;
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
    setReset: React.Dispatch<React.SetStateAction<boolean>>;
};

export function onDown(e: MouseEvent, others: SelectOnDownProps) {
    const {
        lines,
        container,
        drawingItems,
        setStartPoint,
        setIsDrawing,
        setSelectedPoint,
    } = others;

    // const points = getPointsFromLines(lines);
    // const startPoint = getMousePos(e, container);
    // const closestPoint = getClosestPoint(startPoint, points, GRID_UNIT);
    const clickedPoint = getMousePos(e, container);
    const points = getPointsFromLines(lines);
    const closestPoint = getClosestPoint(clickedPoint, points, 5);
    // const closestPoint = clickedPoint;
    console.log("drawingItems", drawingItems);
    console.log("points", points);
    console.log("selectedPoint", closestPoint);
    if (isPointAppearingOnce(closestPoint, points)) {
        setSelectedPoint(closestPoint);
        const clickedLine = drawingItems.find(
            (item) =>
                isSamePoint(item.data.start, closestPoint) ||
                isSamePoint(item.data.end, closestPoint),
        );
        if (clickedLine) {
            setStartPoint(
                isSamePoint(clickedLine.data.start, closestPoint)
                    ? clickedLine.data.end
                    : clickedLine.data.start,
            );
        }
        // setDrawingItems((prev) => {
        //     return prev.filter(
        //         (item) =>
        //             isSamePoint(item.data.start, closestPoint) ||
        //             isSamePoint(item.data.end, closestPoint),
        //     );
        // });
        setIsDrawing(true);
    }

    // setStartPoint(closestPoint);
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
        setDrawingItems,
        setReset,
        selectedPoint,
    } = others;
    if (!startPoint || !isDrawing || !selectedPoint) return;
    app.stage.removeChild();
    const points = getPointsFromLines(lines);
    // const lines = itemsRef.current.map((item) => item.data);
    const end = getMousePos(e, container);
    const updatedEnd = getClosestPoint(end, points, GRID_UNIT / 5);
    const start = startPoint;
    // if (isSamePoint(start, getClosestPoint(end, points, GRID_UNIT / 5))) return;
    graphics.clear();
    textGraphics.text = "";
    angleTextGraphics.text = "";
    // renderLineWithMeasurements({ start, end }, app, graphics, textGraphics);
    // setDrawingItems((prev) => {
    //     return prev.filter(
    //         (item) =>
    //             !isSamePoint(item.data.start, startPoint) &&
    //             !isSamePoint(item.data.end, selectedPoint),
    //     );
    // });
    renderNewLine(startPoint, updatedEnd, setDrawingItems);
    // setReset(true);
    renderAngleBetweenLines(
        [...lines, { start, end }],
        app,
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
    } = others;
    if (!startPoint || !isDrawing || !selectedPoint) return;
    graphics.clear();
    textGraphics.text = "";
    angleTextGraphics.text = "";
    const start = startPoint;
    const end = getMousePos(e, container);
    // console.log(start, end);
    const points = getPointsFromLines(lines);
    if (isSamePoint(selectedPoint, getClosestPoint(end, points, 5))) {
        setIsDrawing(false);
        return;
    }
    // const lines = itemsRef.current.map((item) => item.data);
    const updatedStart = getClosestPoint(start, points, 0);
    const updatedEnd = getClosestPoint(end, points, 0);
    if (isSamePoint(updatedStart, updatedEnd)) {
        setIsDrawing(false);
        return;
    }
    setDrawingItems((prev) => {
        return prev.filter(
            (item) =>
                !isSamePoint(item.data.start, startPoint) &&
                !isSamePoint(item.data.end, selectedPoint),
        );
    });
    renderNewLine(updatedStart, updatedEnd, setDrawingItems);
    // setReset(true);
    // renderAngleBetweenLines(
    //     [...lines, { start: updatedStart, end: updatedEnd }],
    //     app,
    //     graphics,
    //     angleTextGraphics,
    // );
    setIsDrawing(false);
}
