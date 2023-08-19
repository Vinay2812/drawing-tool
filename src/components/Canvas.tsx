import * as PIXI from "pixi.js";
import { ToolsType, tools } from "../tools";
import { DrawingItem, Line, Point } from "./DrawingArea";
import { useEffect, useRef } from "react";
import { renderCanvasGrid, renderGridUnit } from "./renderGrid";
import {
    textGraphicsOptions,
    windowHeight,
    windowWidth,
} from "../tools/utils/config";
import { SmoothGraphics } from "@pixi/graphics-smooth";
import { renderAngleBetweenLines } from "../tools/line";

export type ShapeData = Line;

export type PointerEventsProps = {
    startPoint: Point | null;
    setStartPoint: (point: Point | null) => void;
    isDrawing: boolean;
    setIsDrawing: (val: boolean) => void;
    selectedPoint: Point | null;
    setSelectedPoint: (point: Point | null) => void;
    drawingItems: DrawingItem[];
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
    shapes: Record<ToolsType, ShapeData[]>;
    container: HTMLElement;
    app: PIXI.Application<HTMLCanvasElement>;
    angleTextGraphics: PIXI.Text;
    textGraphics: PIXI.Text;
    graphics: SmoothGraphics;
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >;
    pointNumberRef: React.MutableRefObject<number>;
    lastTouchRef: React.MutableRefObject<{
        x: number;
        y: number;
    }>;
};

type Props = {
    activeTool: ToolsType;
    drawingItems: DrawingItem[];
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >;
    pointNumberRef: React.MutableRefObject<number>;
    appRef: React.MutableRefObject<PIXI.Application<HTMLCanvasElement> | null>;
    setUndoItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
};

export default function Canvas({
    drawingItems,
    setDrawingItems,
    activeTool,
    graphicsStoreRef,
    pointNumberRef,
    appRef,
    setUndoItems,
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
    const lastTouchRef = useRef({ x: 0, y: 0 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getProps = (): PointerEventsProps => {
        return {
            startPoint: startPoint.current,
            isDrawing: isDrawing.current,
            container: containerRef.current!,
            app: appRef.current!,
            angleTextGraphics,
            textGraphics,
            graphics,
            graphicsStoreRef,
            selectedPoint: selectedPoint.current,
            setDrawingItems,
            setStartPoint,
            setSelectedPoint,
            setIsDrawing,
            drawingItems,
            pointNumberRef,
            lastTouchRef,
            shapes: itemsRef.current.reduce((data, item) => {
                if (!data[item.type]) {
                    data[item.type] = [];
                }
                data[item.type].push(item.data);
                return data;
            }, {} as Record<ToolsType, ShapeData[]>),
        };
    };

    function handleOnMove(e: MouseEvent) {
        const props = getProps();
        return tools[activeTool].events.onMove(e, props);
    }

    function handleOnDown(e: MouseEvent) {
        const props = getProps();
        setUndoItems([]);
        return tools[activeTool].events.onDown(e, props);
    }

    function handleOnUp(e: MouseEvent) {
        const props = getProps();
        return tools[activeTool].events.onUp(e, props);
    }

    useEffect(() => {
        if (!appRef.current) {
            containerRef.current = document.getElementById("canvas-container");
            if (!containerRef.current) {
                throw Error("Container not found");
            }
            appRef.current = new PIXI.Application<HTMLCanvasElement>({
                width: windowWidth,
                height: windowHeight,
                backgroundColor: "transparent", // Background color
                backgroundAlpha: 0,
                antialias: true,
                autoDensity: true,
                resolution: devicePixelRatio ?? 1,
            });
            (globalThis as any).__PIXI_APP__ = appRef.current; // eslint-disable-line
            appRef.current.renderer.render(appRef.current.stage);
            // appRef.current.screen.fit(new PIXI.Rectangle(0, 0, 6000, 8000));
            containerRef.current.appendChild(appRef.current.view);
            containerRef.current.scrollTop = 0;
            setTimeout(() => {
                if (!appRef.current || !containerRef.current) return;
                appRef.current.resizeTo = containerRef.current;
                renderCanvasGrid(appRef.current);
                renderGridUnit(appRef.current);
            }, 100);
        }
        const container = containerRef.current!;
        if (!container || !appRef.current) return;
        container.addEventListener("pointerdown", handleOnDown);
        container.addEventListener("pointermove", handleOnMove);
        container.addEventListener("pointerup", handleOnUp);
        container.addEventListener("pointerout", handleOnUp);

        return () => {
            container.removeEventListener("pointerdown", handleOnDown);
            container.removeEventListener("pointermove", handleOnMove);
            container.removeEventListener("pointerup", handleOnUp);
            container.removeEventListener("pointerout", handleOnUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTool, isDrawing]);

    useEffect(() => {
        itemsRef.current = drawingItems;
        drawingItems.forEach((item) => {
            const renderer = tools[item.type].renderer;
            renderer(item.data, appRef.current!, graphicsStoreRef);
        });
        renderAngleBetweenLines(
            drawingItems.map((item) => item.data),
            appRef.current!,
            graphicsStoreRef,
            pointNumberRef,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawingItems, activeTool]);
    return <div></div>;
}
