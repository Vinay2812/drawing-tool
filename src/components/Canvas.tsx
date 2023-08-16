import * as PIXI from "pixi.js";
import { ToolsType, tools } from "../tools";
import { DrawingItem, Point } from "./DrawingArea";
import { useEffect, useRef } from "react";
import { renderAngleBetweenLines } from "../tools/line/renderers";
import { renderCanvasGrid, renderGridUnit } from "./renderGrid";
import { textGraphicsOptions } from "../tools/config";
import { SmoothGraphics } from "@pixi/graphics-smooth";

type Props = {
    activeTool: ToolsType;
    drawingItems: DrawingItem[];
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
    drawingItemRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >;
    pointNumberRef: React.MutableRefObject<number>;
    appRef: React.MutableRefObject<PIXI.Application<HTMLCanvasElement> | null>;
};

export default function Canvas({
    drawingItems,
    setDrawingItems,
    activeTool,
    drawingItemRef,
    pointNumberRef,
    appRef,
}: Props) {
    const containerRef = useRef<HTMLElement | null>(null);

    const startPoint = useRef<Point | null>(null);
    const setStartPoint = (point: Point | null) => (startPoint.current = point);
    const isDrawing = useRef(false);
    const setIsDrawing = (val: boolean) => (isDrawing.current = val);
    const selectedPoint = useRef<Point | null>(null);
    const setSelectedPoint = (point: Point | null) =>
        (selectedPoint.current = point);
    const graphics = new SmoothGraphics();
    const textGraphics = new PIXI.Text("", textGraphicsOptions);
    const angleTextGraphics = new PIXI.Text("", textGraphicsOptions);
    const itemsRef = useRef(drawingItems);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getProps = (): any => {
        return {
            startPoint: startPoint.current,
            isDrawing: isDrawing.current,
            lines: itemsRef.current.map((item) => item.data),
            container: containerRef.current!,
            app: appRef.current!,
            angleTextGraphics,
            textGraphics,
            graphics,
            drawingItemRef,
            selectedPoint: selectedPoint.current,
            setDrawingItems,
            pointNumberRef,
            setStartPoint,
            setSelectedPoint,
            setIsDrawing,
            drawingItems
        };
    };

    function handleOnMove(e: MouseEvent) {
        const props = getProps();
        return tools[activeTool].events.onMove(e, props);
    }

    function handleOnDown(e: MouseEvent) {
        const props = getProps();
        return tools[activeTool].events.onDown(e, props);
    }

    function handleOnUp(e: MouseEvent) {
        const props = getProps();
        return tools[activeTool].events.onUp(e, props);
    }

    useEffect(() => {
        if (!appRef.current) {
            containerRef.current = document.getElementById("canvas-container")!;
            // const { width } = containerRef.current.getBoundingClientRect();
            appRef.current = new PIXI.Application<HTMLCanvasElement>({
                width: window.innerWidth,
                height: window.innerHeight,
                backgroundColor: "transparent", // Background color
                backgroundAlpha: 0,
                antialias: true,
                autoDensity: true,
                resolution: window.devicePixelRatio || 1,
            });
            renderCanvasGrid(appRef.current);
            renderGridUnit(appRef.current, drawingItemRef);

            // Render the stage
            appRef.current.renderer.render(appRef.current.stage);
            containerRef.current.appendChild(appRef.current.view);
        }

        const container = containerRef.current!;
        if (!container || !appRef.current) return;
        container.addEventListener("pointerdown", handleOnDown);
        container.addEventListener("pointermove", handleOnMove);
        container.addEventListener("pointerup", handleOnUp);

        return () => {
            container.removeEventListener("pointerdown", handleOnDown);
            container.removeEventListener("pointermove", handleOnMove);
            container.removeEventListener("pointerup", handleOnUp);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTool, isDrawing]);

    useEffect(() => {
        // const points = getPointsFromLines(drawingItems);
        itemsRef.current = drawingItems;
        drawingItems.forEach((item) => {
            const renderer = tools[item.type].renderer;
            renderer(item.data, appRef.current!, drawingItemRef);
            renderAngleBetweenLines(
                drawingItems.map((item) => item.data),
                appRef.current!,
                drawingItemRef,
                pointNumberRef,
            );
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawingItems, activeTool]);
    return <div></div>;
}
