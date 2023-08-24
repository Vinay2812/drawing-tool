/* eslint-disable @typescript-eslint/no-unused-vars */
import * as PIXI from "pixi.js";
import Toolbox from "./Toolbox";
import { lazy, useEffect, useMemo, useRef, useState } from "react";
import { tools, type ToolsType } from "../tools";
import { SmoothGraphics } from "@pixi/graphics-smooth";
import { getShapesData } from "../utils/shapes";
import { getDistance } from "../tools/utils/calculations";
import { Viewport } from "pixi-viewport";
import {
    GRID_UNIT,
    LINE_WIDTH,
    initialTextGraphicsOptions,
    isMobile,
} from "../tools/utils/config";
import { cn } from "../utils/helper";
const Canvas = lazy(() => import("./Canvas"));

export type Point = {
    x: number;
    y: number;
};

export type Line = {
    shapeId: number;
    start: Point;
    end: Point;
};

export type Circle = {
    shapeId: number;
    start: Point;
    end: Point;
};

export type Pencil = {
    points: Point[];
    shapeId: number;
};

export type DrawingItem = {
    type: ToolsType;
    data: Line | Circle | Pencil;
    id: number;
};

export type ShapeType = "line" | "circle" | "triangle" | "polygon";
export type AngleData = {
    degree: number;
    point: Point;
};
export type LineData = Line & {
    distance: number;
};
export type CircleData = Circle & {
    radius: number;
};
export type PolygonData = {
    lines: LineData[];
    angles: AngleData[];
};
export type ShapeData =
    | {
          type: "line";
          data: LineData;
      }
    | {
          type: "circle";
          data: CircleData;
      }
    | {
          type: "triangle";
          data: PolygonData;
      }
    | {
          type: "polygon";
          data: PolygonData;
      };

export interface CanvasConfig {
    gridSize: number;
    lineWidth: number;
    textGraphicsOptions: Partial<PIXI.ITextStyle> | PIXI.TextStyle;
    showSubGrid: boolean;
    unit: string;
}

export type DrawingAreaConfig = Omit<
    Omit<CanvasConfig, "textGraphicsOptions">,
    "lineWidth"
> & {
    canvasWidth: number;
    canvasHeight: number;
    hiddenTools: ToolsType[];
};

export default function DrawingArea(props: DrawingAreaConfig) {
    const appRef = useRef<PIXI.Application<HTMLCanvasElement> | null>(null);
    const viewportRef = useRef<Viewport | null>(null);
    const [activeTool, setActiveTool] = useState<ToolsType>("select");
    const [drawingItems, setDrawingItems] = useState<DrawingItem[]>([]);
    const [undoItems, setUndoItems] = useState<DrawingItem[]>([]);
    const graphicsStoreRef = useRef<
        Record<string, Array<SmoothGraphics | PIXI.Text>>
    >({});
    const pointNumberRef = useRef<number>(0);
    const [shapesData, setShapesData] = useState<ShapeData[]>([]);
    const gridGraphics = useMemo(() => {
        return new SmoothGraphics();
    }, []);
    // const [hiddenTools, setHiddenTools] = useState<ToolsType[]>(["circle"]);
    // const [gridSize, setGridSize] = useState(GRID_UNIT);
    const lineWidth = useMemo(() => LINE_WIDTH, []);
    // const [showSubGrid, setShowSubGrid] = useState(false);
    const textGraphicsOptions = useMemo<
        Partial<PIXI.ITextStyle> | PIXI.TextStyle
    >(
        () => ({
            fill: "#000",
            fontWeight: "600",
            fontSize:
                Math.sqrt(props.gridSize + lineWidth) / (isMobile() ? 0.7 : 3) +
                ((35 - 20) * (window.innerWidth - 320)) / (1920 - 320),
        }),
        [props.gridSize, lineWidth],
    );
    // const [unit, setUnit] = useState("cm");
    // const [canvasWidth, setCanvasWidth] = useState(
    //     Math.min(window.innerWidth, 800),
    // );
    // const [canvasHeight, setCanvasHeight] = useState(600);

    function handleSubmit() {
        const lines = drawingItems
            .filter((item) => item.type === "line")
            .map((item) => item.data) as Line[];

        const combinedLines = getShapesData(lines, props.gridSize);
        const circles: ShapeData[] = drawingItems
            .filter(({ type }) => type === "circle")
            .map((item) => {
                const circleData = item.data as Circle;
                return {
                    type: "circle",
                    data: {
                        start: circleData.start,
                        end: circleData.end,
                        radius: getDistance(circleData.start, circleData.end),
                        shapeId: circleData.shapeId,
                    } as CircleData,
                };
            });
        setShapesData([...combinedLines, ...circles]);
    }

    useEffect(() => {
        shapesData.forEach((shape, idx) => {
            console.log(`${shape.type}-${idx + 1}`, shape.data);
        });
    }, [shapesData]);

    return (
        <div className="flex flex-col items-center">
            {/* <div className="m-2 overflow-scroll w-[600px] h-[500px]"> */}
            <Toolbox
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                drawingItems={drawingItems}
                setDrawingItems={setDrawingItems}
                undoItems={undoItems}
                setUndoItems={setUndoItems}
                // drawingItems={drawingItems}
                // setDrawingItems={setActiveDrawingItems}
                graphicsStoreRef={graphicsStoreRef}
                pointNumberRef={pointNumberRef}
                appRef={appRef}
                viewportRef={viewportRef}
                hiddenTools={props.hiddenTools}
                className={cn(
                    "flex gap-2 justify-between py-4 h-[72px]",
                    `w-[${props.canvasWidth - 20}px]`,
                    "bg-white",
                )}
                style={{
                    width: props.canvasWidth - 20,
                    height: 72,
                }}
            />
            <div
                id="canvas-container"
                className={cn(
                    `!w-[${props.canvasWidth - 20}px]`,
                    `!h-[${props.canvasHeight - 1}px]`,
                    `${tools[activeTool].cursor}`,
                    "bg-white outline outline-1 outline-gray-400 !overflow-hidden relative",
                )}
                style={{
                    width: props.canvasWidth - 20,
                    height: props.canvasHeight - 1,
                }}
            >
                <div className="absolute right-2 top-2 flex flex-col gap-1">
                    <button
                        className=" bg-slate-300 p-2 hover:bg-slate-200"
                        id="zoom-in"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" x2="16.65" y1="21" y2="16.65" />
                            <line x1="11" x2="11" y1="8" y2="14" />
                            <line x1="8" x2="14" y1="11" y2="11" />
                        </svg>
                    </button>
                    <button
                        className="bg-slate-300 p-2 hover:bg-slate-200"
                        id="zoom-out"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" x2="16.65" y1="21" y2="16.65" />
                            <line x1="8" x2="14" y1="11" y2="11" />
                        </svg>
                    </button>
                </div>
            </div>
            <Canvas
                activeTool={activeTool}
                // drawingItems={drawingItemsRef.current}
                drawingItems={drawingItems}
                setDrawingItems={setDrawingItems}
                graphicsStoreRef={graphicsStoreRef}
                pointNumberRef={pointNumberRef}
                appRef={appRef}
                viewportRef={viewportRef}
                setUndoItems={setUndoItems}
                gridGraphics={gridGraphics}
                gridSize={props.gridSize}
                showSubGrid={props.showSubGrid}
                lineWidth={lineWidth}
                textGraphicsOptions={textGraphicsOptions}
                canvasWidth={props.canvasWidth - 20}
                canvasHeight={props.canvasHeight - 1}
                unit={props.unit}
            />
            <button
                className="fixed right-10 bottom-5 z-10 bg-red-500 text-white py-2 px-4 disabled:bg-red-300 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={!drawingItems.length}
            >
                Submit
            </button>
        </div>
    );
}
