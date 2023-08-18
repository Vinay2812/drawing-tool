import * as PIXI from "pixi.js";
import Toolbox from "./Toolbox";
import { lazy, useEffect, useRef, useState } from "react";
import { tools, type ToolsType } from "../tools";
import { SmoothGraphics } from "@pixi/graphics-smooth";
import { getShapesData } from "../utils/shapes";
import { getDistance } from "../tools/utils/calculations";
import { windowHeight } from "../tools/utils/config";
const Canvas = lazy(() => import("./Canvas"));

export type Point = {
    x: number;
    y: number;
};

export type Line = {
    start: Point;
    end: Point;
};

export type DrawingItem = {
    type: ToolsType;
    data: Line;
};

export type ShapeType = "line" | "circle" | "triangle" | "polygon";
export type AngleData = {
    degree: number;
    point: Point;
};
export type LineData = {
    start: Point;
    end: Point;
    distance: number;
};
export type CircleData = Line & {
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
    const graphicsStoreRef = useRef<
        Record<string, Array<SmoothGraphics | PIXI.Text>>
    >({});
    const pointNumberRef = useRef<number>(0);
    const [shapesData, setShapesData] = useState<ShapeData[]>([]);
    function handleSubmit() {
        const lines = drawingItems
            .filter((item) => item.type === "line")
            .map((item) => item.data);

        const combinedLines = getShapesData(lines);
        const circles: ShapeData[] = drawingItems
            .filter(({ type }) => type === "circle")
            .map((item) => {
                return {
                    type: "circle",
                    data: {
                        ...item.data,
                        radius: getDistance(item.data.start, item.data.end),
                    } as CircleData,
                };
            });
        setShapesData([...combinedLines, ...circles]);
    }
    useEffect(() => {
        // console.clear();
    }, [drawingItems, shapesData]);
    useEffect(() => {
        // console.log("shapes data", shapesData)
        shapesData.forEach((shape, idx) => {
            console.log(`${shape.type}-${idx + 1}`, shape.data);
        });
    }, [shapesData]);

    const canvasWidth = Math.min(window.innerWidth, 800);
    const canvasHeight = 2 * window.innerHeight;

    return (
        <div className="flex flex-col items-center">
            {/* <div className="m-2 overflow-scroll w-[600px] h-[500px]"> */}
            <Toolbox
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                setDrawingItems={setDrawingItems}
                graphicsStoreRef={graphicsStoreRef}
                pointNumberRef={pointNumberRef}
                appRef={appRef}
                className={`flex gap-2 justify-between py-1 lg:py-2 h-[55px] w-[${canvasWidth}px] bg-white`}
            />
            <div
                id="canvas-container"
                className={`w-[${canvasWidth}px] h-[${canvasHeight - 55}px] ${
                    tools[activeTool].cursor ?? "cursor-pointer"
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
            />
            <button
                className="fixed right-10 bottom-5 z-10 bg-red-500 text-white py-2 px-4"
                onClick={handleSubmit}
            >
                Submit
            </button>
        </div>
    );
}
