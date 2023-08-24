import * as PIXI from "pixi.js";
import { ToolsType, tools } from "../tools";
import { Circle, DrawingItem, Line, Pencil, Point } from "./DrawingArea";
import { useEffect, useRef } from "react";
import { renderCanvasGrid } from "./renderGrid";
import { GRID_UNIT, textGraphicsOptions } from "../tools/utils/config";
import { SmoothGraphics } from "@pixi/graphics-smooth";
import { renderAngleBetweenLines } from "../tools/line";
import { Viewport } from "pixi-viewport";
import {
    findPointAtDistance,
    getPointerPosition,
    isPointerNearEdges,
    isPointerOutside,
} from "../tools/utils/calculations";
import { delay } from "../tools/utils/helpers";

export type Shape = Line | Circle | Pencil;

export type PointerEventsProps = {
    startPoint: Point | null;
    setStartPoint: (point: Point | null) => void;
    isDrawing: boolean;
    setIsDrawing: (val: boolean) => void;
    selectedPoint: Point | null;
    setSelectedPoint: (point: Point | null) => void;
    drawingItems: DrawingItem[];
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
    shapes: Record<ToolsType, Shape[]>;
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
    pencilPointsRef: React.MutableRefObject<Point[]>;
    viewport: Viewport;
    gridGraphics: SmoothGraphics;
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
    const pencilPointsRef = useRef<Point[]>([]);
    const originalWidth = 10000; // Initial width of the world
    const originalHeight = 10000; // Initial height of the world
    const maxZoomPercent = 4;
    const minZoomPercent = 0.5;

    const getProps = (): PointerEventsProps => {
        return {
            startPoint: startPoint.current,
            isDrawing: isDrawing.current,
            container: containerRef.current!,
            app: appRef.current!,
            viewport: viewportRef.current!,
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
            pencilPointsRef,
            gridGraphics,
            shapes: itemsRef.current.reduce((data, item) => {
                if (!data[item.type]) {
                    data[item.type] = [];
                }
                data[item.type].push(item.data);
                return data;
            }, {} as Record<ToolsType, Shape[]>),
        };
    };

    async function handlePointNearEdge(e: MouseEvent) {
        let touchingEdge = isPointerNearEdges(e, containerRef.current!);
        let outsideContainer = isPointerOutside(e, containerRef.current!);
        let timeSpent = 3;

        while (touchingEdge && !outsideContainer) {
            const endPoint = getPointerPosition(
                e,
                containerRef.current!,
                viewportRef.current!,
            );
            const start = startPoint.current!;
            const line: Line = {
                start: endPoint,
                end: start,
                shapeId: -1,
            };

            if (!start || !endPoint) {
                break;
            }

            const shift = findPointAtDistance(line, -10);
            const distanceFactor =
                (GRID_UNIT * timeSpent) / (viewportRef.current!.scale.x ?? 1);
            const deltaX = (start.x - shift.x) / distanceFactor;
            const deltaY = (start.y - shift.y) / distanceFactor;

            const newCenter = {
                x: viewportRef.current!.center.x - deltaX,
                y: viewportRef.current!.center.y - deltaY,
            };

            // Update the viewport's center position
            viewportRef.current!.moveCenter(newCenter.x, newCenter.y);
            gridGraphics.clear()
            renderCanvasGrid(viewportRef.current, appRef.current, gridGraphics);

            // Wait for a short delay
            await delay(100);

            timeSpent += 1;

            // Update edge status
            touchingEdge = isPointerNearEdges(e, containerRef.current!);
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

    const onResize = () => {
        appRef.current!.renderer.resize(window.innerWidth, window.innerHeight);
        viewportRef.current!.resize(window.innerWidth, window.innerHeight);
    };

    function renderDrawingItems(drawingItems: DrawingItem[]) {
        drawingItems.forEach((item) => {
            const renderer = tools[item.type].renderer;
            renderer(
                item.data as never,
                viewportRef.current!,
                graphicsStoreRef,
            );
        });
        renderAngleBetweenLines(
            drawingItems
                .filter((item) => item.type === "line")
                .map((item) => item.data) as Line[],
            viewportRef.current!,
            graphicsStoreRef,
            pointNumberRef,
            graphics,
        );
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
        renderCanvasGrid(viewport, app, gridGraphics);
    }

    function createSetup() {
        const container =
            document.querySelector<HTMLCanvasElement>("#canvas-container");
        if (!container) {
            throw Error("Container not found");
        }
        const zoomIn = container.querySelector<HTMLButtonElement>("#zoom-in")!;
        const zoomOut =
            container.querySelector<HTMLButtonElement>("#zoom-out")!;

        const app = new PIXI.Application<HTMLCanvasElement>({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: "transparent", // Background color
            backgroundAlpha: 0,
            antialias: true,
            autoDensity: true,
            resolution: devicePixelRatio ?? 1,
        });
        container.appendChild(app.view);
        // const {x, y, width, height} = container.getBoundingClientRect()

        const viewport = new Viewport({
            worldWidth: originalWidth,
            worldHeight: originalHeight,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            events: app.renderer.events,
        })
            .pinch({
                noDrag: true,
                factor: 1,
                percent: 1,
                axis: "all",
            })
            .wheel()
            // .decelerate()
            .drag({
                wheel: false,
            });

        app.renderer.render(app.stage);
        app.ticker.start();

        viewport.addChild(gridGraphics);
        app.stage.addChild(viewport);

        viewport.on("zoomed", () => {
            handleViewPortZoom(
                gridGraphics,
                viewportRef.current!,
                appRef.current!,
            );
        });

        viewport.on("moved", () => {
            gridGraphics.clear();
            renderCanvasGrid(viewport, appRef.current, gridGraphics);
        });

        zoomIn.onclick = () => {
            const newScale = Math.min(
                viewportRef.current!.scale.x * 1.2,
                maxZoomPercent,
            );
            viewportRef.current!.setZoom(newScale);
            handleViewPortZoom(
                gridGraphics,
                viewportRef.current!,
                appRef.current!,
            );
        };
        zoomOut.onclick = () => {
            const newScale = Math.max(
                viewportRef.current!.scale.x / 1.2,
                minZoomPercent,
            );
            viewportRef.current!.setZoom(newScale);
            handleViewPortZoom(
                gridGraphics,
                viewportRef.current!,
                appRef.current!,
            );
        };

        containerRef.current = container;
        appRef.current = app;
        viewportRef.current = viewport;

        setTimeout(() => {
            if (!app || !containerRef.current) return;
            renderCanvasGrid(viewport, app, gridGraphics);
        }, 100);
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

    function addEventListeners() {
        const container = containerRef.current!;
        if (!container || !appRef.current || !viewportRef.current) return;
        const viewport = viewportRef.current;
        viewport.addEventListener("pointerdown", handleOnDown);
        viewport.addEventListener("pointermove", handleOnMove);
        viewport.addEventListener("pointerup", handleOnUp);
        // viewport.addEventListener("pointerout", handleOnUp);
        window.addEventListener("resize", onResize);
    }

    function removeEventListeners() {
        const container = containerRef.current!;
        if (!container || !appRef.current || !viewportRef.current) return;
        const viewport = viewportRef.current;
        viewport.removeEventListener("pointerdown", handleOnDown);
        viewport.removeEventListener("pointermove", handleOnMove);
        viewport.removeEventListener("pointerup", handleOnUp);
        // viewport.removeEventListener("pointerout", handleOnUp);
        // viewport.removeEventListener("pointerout", (e) =>
        //     resetViewport(e, viewport, appRef.current!),
        // );

        window.removeEventListener("resize", onResize);
    }

    useEffect(() => {
        if (!appRef.current) {
            createSetup();
        }
        addEventListeners();
        return () => {
            removeEventListeners();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTool]);

    useEffect(() => {
        itemsRef.current = drawingItems;
        renderDrawingItems(drawingItems);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawingItems, activeTool]);
    return <div></div>;
}
