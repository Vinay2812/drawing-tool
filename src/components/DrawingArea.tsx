import * as PIXI from "pixi.js";
import Toolbox from "./Toolbox";
import { lazy, useEffect, useRef, useState } from "react";
import { tools, type ToolsType } from "../tools";
import { SmoothGraphics } from "@pixi/graphics-smooth";
import { getShapesData } from "../utils/shapes";
import { getDistance } from "../tools/utils/calculations";
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

export default function DrawingArea() {
    const appRef = useRef<PIXI.Application<HTMLCanvasElement> | null>(null);
    const [activeTool, setActiveTool] = useState<ToolsType>("select");
    const [drawingItems, setDrawingItems] = useState<DrawingItem[]>([]);
    const [undoItems, setUndoItems] = useState<DrawingItem[]>([]);
    const graphicsStoreRef = useRef<
        Record<string, Array<SmoothGraphics | PIXI.Text>>
    >({});
    const pointNumberRef = useRef<number>(0);
    const [shapesData, setShapesData] = useState<ShapeData[]>([]);

    useEffect(() => {
        console.log("drawing items", drawingItems);
    }, [drawingItems]);

    function handleSubmit() {
        const lines = drawingItems
            .filter((item) => item.type === "line")
            .map((item) => item.data) as Line[];

        const combinedLines = getShapesData(lines);
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
        // console.log("shapes data", shapesData)
        shapesData.forEach((shape, idx) => {
            console.log(`${shape.type}-${idx + 1}`, shape.data);
        });
    }, [shapesData]);

    const canvasWidth = Math.min(window.innerWidth, 800);
    // const canvasHeight = 2 * window.innerHeight;
    const canvasHeight = 600;

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
                className={`flex gap-2 justify-between py-4 h-[72px] w-[${
                    canvasWidth - 20
                }px] bg-white`}
            />
            <div
                id="canvas-container"
                className={`w-[${canvasWidth - 20}px] h-[${
                    canvasHeight - 1
                }px] ${
                    tools[activeTool].cursor
                } bg-white outline outline-1 outline-gray-400 overflow-clip`}
            />
            <Canvas
                activeTool={activeTool}
                // drawingItems={drawingItemsRef.current}
                drawingItems={drawingItems}
                setDrawingItems={setDrawingItems}
                graphicsStoreRef={graphicsStoreRef}
                pointNumberRef={pointNumberRef}
                appRef={appRef}
                setUndoItems={setUndoItems}
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
