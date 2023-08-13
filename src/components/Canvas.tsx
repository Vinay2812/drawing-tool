import * as PIXI from "pixi.js";
import { ToolsType, tools } from "../tools";
import { DrawingItem, Point } from "./DrawingArea";
import { useEffect, useRef, useState } from "react";
import {
    renderAngleBetweenLines,
    renderLineWithMeasurements,
} from "../tools/line/renderers";
import { renderCanvasGrid, renderGridUnit } from "./renderGrid";
import { textGraphicsOptions } from "../tools/config";
import { getMousePos } from "../tools/line";
import {
    LineOnDownProps,
    LineOnMoveProps,
    LineOnUpProps,
} from "../tools/line/events";
import {
    SelectOnDownProps,
    SelectOnMoveProps,
    SelectOnUpProps,
} from "../tools/select/events";

type Props = {
    activeTool: keyof typeof tools;
    drawingItems: DrawingItem[];
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
};

export default function Canvas({
    drawingItems,
    setDrawingItems,
    activeTool,
}: Props) {
    const appRef = useRef<PIXI.Application<HTMLCanvasElement> | null>(null);
    const containerRef = useRef<HTMLElement | null>(null);

    const startPoint = useRef<Point | null>(null);
    const setStartPoint = (point: Point | null) => (startPoint.current = point);
    const isDrawing = useRef(false);
    const setIsDrawing = (val: boolean) => (isDrawing.current = val);
    const selectedPoint = useRef<Point | null>(null);
    const setSelectedPoint = (point: Point | null) =>
        (selectedPoint.current = point);
    const graphics = new PIXI.Graphics();
    const textGraphics = new PIXI.Text("", textGraphicsOptions);
    const angleTextGraphics = new PIXI.Text("", textGraphicsOptions);
    const [reset, setReset] = useState(false);
    const itemsRef = useRef(drawingItems);

    const getProps = (
        activeTool: ToolsType,
        event: "up" | "down" | "move",
    ): any => {
        const key = `${activeTool}-${event}`;
        switch (key) {
            case "line-move":
                return {
                    startPoint: startPoint.current,
                    isDrawing: isDrawing.current,
                    lines: itemsRef.current.map((item) => item.data),
                    container: containerRef.current!,
                    app: appRef.current!,
                    angleTextGraphics,
                    textGraphics,
                    graphics,
                } as LineOnMoveProps;
            case "line-down":
                return {
                    lines: itemsRef.current.map((item) => item.data),
                    container: containerRef.current!,
                    setStartPoint,
                    setIsDrawing,
                } as LineOnDownProps;
            case "line-up":
                return {
                    startPoint: startPoint.current,
                    isDrawing: isDrawing.current,
                    lines: itemsRef.current.map((item) => item.data),
                    setIsDrawing,
                    angleTextGraphics,
                    textGraphics,
                    graphics,
                    setDrawingItems,
                    app: appRef.current!,
                    container: containerRef.current!,
                } as LineOnUpProps;
            case "select-up":
                return {
                    startPoint: startPoint.current,
                    selectedPoint: selectedPoint.current,
                    isDrawing: isDrawing.current,
                    lines: itemsRef.current.map((item) => item.data),
                    setIsDrawing,
                    angleTextGraphics,
                    textGraphics,
                    graphics,
                    setDrawingItems,
                    app: appRef.current!,
                    container: containerRef.current!,
                    setReset
                } as SelectOnUpProps;
            case "select-down":
                return {
                    lines: itemsRef.current.map((item) => item.data),
                    container: containerRef.current!,
                    setStartPoint,
                    setIsDrawing,
                    setDrawingItems,
                    drawingItems: itemsRef.current,
                    setSelectedPoint,
                } as SelectOnDownProps;
            case "select-move":
                return {
                    startPoint: startPoint.current,
                    isDrawing: isDrawing.current,
                    lines: itemsRef.current.map((item) => item.data),
                    container: containerRef.current!,
                    app: appRef.current!,
                    angleTextGraphics,
                    textGraphics,
                    graphics,
                } as SelectOnMoveProps;
            default:
                return {};
        }
    };

    function handleOnMove(e: MouseEvent) {
        const props = getProps(activeTool, "move");
        return tools[activeTool].events.onMove(e, props);
    }

    function handleOnDown(e: MouseEvent) {
        const props = getProps(activeTool, "down");
        return tools[activeTool].events.onDown(e, props);
        // console.log(getMousePos(e, containerRef.current!))
    }

    function handleOnUp(e: MouseEvent) {
        const props = getProps(activeTool, "up");
        return tools[activeTool].events.onUp(e, props);
    }

    useEffect(() => {
        if (reset) {
            containerRef.current!.removeChild(appRef.current!.view)
            appRef.current = null;
            containerRef.current!.removeEventListener("mousedown", handleOnDown);
            containerRef.current!.removeEventListener("mousemove", handleOnMove);
            containerRef.current!.removeEventListener("mouseup", handleOnUp);
            setReset(false);
        }
        if (!appRef.current) {
            containerRef.current = document.getElementById("canvas-container")!;
            // const { width } = containerRef.current.getBoundingClientRect();
            appRef.current = new PIXI.Application<HTMLCanvasElement>({
                width: window.innerWidth,
                height: window.innerHeight,
                backgroundColor: "transparent", // Background color
                backgroundAlpha: 0,
                resolution: window.devicePixelRatio || 1,
            });
            renderCanvasGrid(appRef.current);
            renderGridUnit(appRef.current);

            // Render the stage
            appRef.current.renderer.render(appRef.current.stage);
            containerRef.current.appendChild(appRef.current.view);
        }

        const container = containerRef.current!;
        if (!container || !appRef.current) return;
        container.addEventListener("mousedown", handleOnDown);
        container.addEventListener("mousemove", handleOnMove);
        container.addEventListener("mouseup", handleOnUp);

        return () => {
            container.removeEventListener("mousedown", handleOnDown);
            container.removeEventListener("mousemove", handleOnMove);
            container.removeEventListener("mouseup", handleOnUp);
        };
    }, [activeTool, reset, isDrawing]);

    useEffect(() => {
        // const points = getPointsFromLines(drawingItems);
        itemsRef.current = drawingItems;
        drawingItems.forEach((item) => {
            renderLineWithMeasurements(item.data, appRef.current!);
            renderAngleBetweenLines(
                drawingItems.map((item) => item.data),
                appRef.current!,
            );
        });
        // setReset(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawingItems, activeTool]);
    return <div></div>;
}
