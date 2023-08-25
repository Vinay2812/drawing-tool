import * as PIXI from "pixi.js";
import { ToolsType, tools } from "../../tools";
import {
    CanvasConfig,
    Circle,
    DrawingItem,
    Line,
    Pencil,
    Point,
} from "../drawing-tool";
import { useEffect, useRef } from "react";
import { renderCanvasGrid } from "./renderGrid";
import { SmoothGraphics } from "@pixi/graphics-smooth";
import { renderAngleBetweenLines } from "../../tools/line";
import { Viewport } from "pixi-viewport";
import {
    findPointAtDistance,
    getPointerPosition,
    isPointerNearEdges,
    isPointerOutside,
} from "../../tools/utils/calculations";
import { delay } from "../../tools/utils/helpers";
import { createPixiSetup } from "./setup";

export type Shape = Line | Circle | Pencil;

export type PointerEventsProps = {
    startPoint: Point | null;
    setStartPoint: (point: Point | null) => void;
    isDrawing: boolean;
    setIsDrawing: (val: boolean) => void;
    selectedPoint: Point | null;
    setSelectedPoint: (point: Point | null) => void;
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
    shapes: Record<ToolsType, Shape[]>;
    container: HTMLElement;
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >;
    pointNumberRef: React.MutableRefObject<number>;
    pencilPointsRef: React.MutableRefObject<Point[]>;
    viewport: Viewport;
    canvasConfig: CanvasConfig;
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
    viewportRef: React.MutableRefObject<Viewport | null>;
    gridGraphics: SmoothGraphics;
    gridSize: number;
    lineWidth: number;
    textGraphicsOptions: Partial<PIXI.ITextStyle> | PIXI.TextStyle;
    showSubGrid: boolean;
    canvasWidth: number;
    canvasHeight: number;
    unit: string;
    defaultDrawingItems: DrawingItem[];
};

export default function Canvas({
    drawingItems,
    setDrawingItems,
    activeTool,
    graphicsStoreRef,
    pointNumberRef,
    appRef,
    setUndoItems,
    viewportRef,
    gridGraphics,
    gridSize,
    lineWidth,
    textGraphicsOptions,
    showSubGrid,
    canvasWidth,
    canvasHeight,
    unit,
    defaultDrawingItems,
}: Props) {
    const containerRef = useRef<HTMLElement | null>(null);
    const startPoint = useRef<Point | null>(null);
    const setStartPoint = (point: Point | null) => (startPoint.current = point);
    const isDrawing = useRef(false);
    const setIsDrawing = (val: boolean) => (isDrawing.current = val);
    const selectedPoint = useRef<Point | null>(null);
    const setSelectedPoint = (point: Point | null) =>
        (selectedPoint.current = point);
    const itemsRef = useRef(drawingItems);
    const pencilPointsRef = useRef<Point[]>([]);
    const maxZoomPercent = 4;
    const minZoomPercent = 0.5;
    const canvasConfig = {
        gridSize,
        lineWidth,
        textGraphicsOptions,
        showSubGrid,
        unit,
    };

    const getProps = (): PointerEventsProps => {
        return {
            startPoint: startPoint.current,
            isDrawing: isDrawing.current,
            container: containerRef.current!,
            viewport: viewportRef.current!,
            graphicsStoreRef,
            selectedPoint: selectedPoint.current,
            setDrawingItems,
            setStartPoint,
            setSelectedPoint,
            setIsDrawing,
            pointNumberRef,
            pencilPointsRef,
            shapes: itemsRef.current.reduce((data, item) => {
                if (!data[item.type]) {
                    data[item.type] = [];
                }
                data[item.type].push(item.data);
                return data;
            }, {} as Record<ToolsType, Shape[]>),
            canvasConfig,
        };
    };

    async function handlePointNearEdge(e: MouseEvent) {
        let touchingEdge = isPointerNearEdges(
            e,
            containerRef.current!,
            canvasConfig.gridSize,
        );
        let outsideContainer = isPointerOutside(e, containerRef.current!);

        while (touchingEdge && !outsideContainer) {
            const endPoint = getPointerPosition(
                e,
                containerRef.current!,
                viewportRef.current!,
            );
            const start = startPoint.current!;
            const line: Line = {
                start: start,
                end: endPoint,
                shapeId: -1,
            };
            if (!start || !endPoint) {
                break;
            }

            const travelDistance = canvasConfig.gridSize * 0.01;

            const shift = findPointAtDistance(line, travelDistance);
            const deltaX = start.x - shift.x;
            const deltaY = start.y - shift.y;

            const newCenter = {
                x: viewportRef.current!.center.x - deltaX,
                y: viewportRef.current!.center.y - deltaY,
            };

            // Update the viewport's center position
            viewportRef.current!.moveCenter(newCenter.x, newCenter.y);
            gridGraphics.clear();
            renderCanvasGrid(
                viewportRef.current,
                appRef.current,
                gridGraphics,
                canvasConfig,
            );

            // Wait for a short delay
            await delay(100);

            // Update edge status
            touchingEdge = isPointerNearEdges(
                e,
                containerRef.current!,
                canvasConfig.gridSize,
            );
            outsideContainer = isPointerOutside(e, containerRef.current!, -5);

            if (outsideContainer) {
                const props = getProps();
                return tools[activeTool].events.onUp(e, props);
            }

            const props = getProps();
            tools[activeTool].events.onMove(e, props);
        }
    }

    async function handleOnMove(e: MouseEvent) {
        if (startPoint.current) {
            await handlePointNearEdge(e);
        }
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

    function handleViewPortZoom(
        gridGraphics: SmoothGraphics,
        viewport: Viewport,
        app: PIXI.Application<HTMLCanvasElement>,
    ) {
        isDrawing.current = false;
        pencilPointsRef.current = [];
        const restrictedZoomFactor = Math.min(
            maxZoomPercent,
            Math.max(minZoomPercent, viewport.scale.x),
        );
        viewport.setZoom(restrictedZoomFactor);
        renderCanvasGrid(viewport, app, gridGraphics, canvasConfig);
    }

    function handleZoomButtonClick(scale: number) {
        viewportRef.current!.setZoom(scale);
        handleViewPortZoom(gridGraphics, viewportRef.current!, appRef.current!);
    }

    function renderDrawingItems(drawingItems: DrawingItem[], editable = true) {
        drawingItems.forEach((item) => {
            const renderer = tools[item.type].renderer;
            renderer(
                item.data as never,
                viewportRef.current!,
                graphicsStoreRef,
                canvasConfig,
                editable,
            );
        });
        renderAngleBetweenLines(
            drawingItems
                .filter((item) => item.type === "line")
                .map((item) => item.data) as Line[],
            viewportRef.current!,
            graphicsStoreRef,
            pointNumberRef,
            canvasConfig,
            editable,
        );
    }

    function addEventListeners() {
        const viewport = viewportRef.current;
        if (!viewport) return;
        viewport.addEventListener("pointerdown", handleOnDown);
        viewport.addEventListener("pointermove", handleOnMove);
        viewport.addEventListener("pointerup", handleOnUp);
    }

    function removeEventListeners() {
        const viewport = viewportRef.current;
        if (!viewport) return;
        viewport.removeEventListener("pointerdown", handleOnDown);
        viewport.removeEventListener("pointermove", handleOnMove);
        viewport.removeEventListener("pointerup", handleOnUp);
    }

    function initializeSetup() {
        createPixiSetup(
            appRef,
            viewportRef,
            containerRef,
            "#canvas-container",
            canvasWidth,
            canvasHeight,
        );
        const app = appRef.current!;
        const viewport = viewportRef.current!;
        const container = containerRef.current!;

        renderCanvasGrid(viewport, app, gridGraphics, canvasConfig);
        renderDrawingItems(defaultDrawingItems, false);

        viewport.on("zoomed", () => {
            handleViewPortZoom(
                gridGraphics,
                viewportRef.current!,
                appRef.current!,
            );
        });

        viewport.on("moved", () => {
            gridGraphics.clear();
            renderCanvasGrid(
                viewport,
                appRef.current,
                gridGraphics,
                canvasConfig,
            );
        });
        const zoomIn = container.querySelector<HTMLButtonElement>("#zoom-in")!;
        const zoomOut =
            container.querySelector<HTMLButtonElement>("#zoom-out")!;
        zoomIn.onclick = () => {
            const newScale = Math.min(
                viewportRef.current!.scale.x * 1.2,
                maxZoomPercent,
            );
            handleZoomButtonClick(newScale);
        };
        zoomOut.onclick = () => {
            const newScale = Math.max(
                viewportRef.current!.scale.x / 1.2,
                minZoomPercent,
            );
            handleZoomButtonClick(newScale);
        };
    }

    useEffect(() => {
        if (!viewportRef.current) return;
        const viewport = viewportRef.current;
        if (activeTool === "select") {
            viewport.plugins.resume("drag");
        } else {
            viewport.plugins.pause("drag");
        }
    }, [activeTool, viewportRef]);

    useEffect(() => {
        if (!appRef.current) {
            initializeSetup();
        }
        addEventListeners();
        return () => {
            removeEventListeners();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTool, canvasWidth, canvasHeight]);

    useEffect(() => {
        itemsRef.current = drawingItems;
        renderDrawingItems(drawingItems);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawingItems, activeTool]);
    return <div />;
}
