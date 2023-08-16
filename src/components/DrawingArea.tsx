import * as PIXI from "pixi.js";
import Toolbox from "./Toolbox";
import { lazy, useRef, useState } from "react";
import { tools, type ToolsType } from "../tools";
import { SmoothGraphics } from "@pixi/graphics-smooth";
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

export default function DrawingArea() {
    const appRef = useRef<PIXI.Application<HTMLCanvasElement> | null>(null);
    const [activeTool, setActiveTool] = useState<ToolsType>("line");
    const [drawingItems, setDrawingItems] = useState<DrawingItem[]>([]);
    const drawingItemRef = useRef<
        Record<string, Array<SmoothGraphics | PIXI.Text>>
    >({});
    const pointNumberRef = useRef<number>(0);
    return (
        <div className="flex flex-col overflow-hidden">
            <Toolbox
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                setDrawingItems={setDrawingItems}
                drawingItemRef={drawingItemRef}
                pointNumberRef={pointNumberRef}
                appRef={appRef}
            />
            <div
                id="canvas-container"
                className={`w-auto overflow-hidden ${
                    tools[activeTool].cursor ?? "cursor-pointer"
                } bg-slate-950`}
            />
            <Canvas
                activeTool={activeTool}
                // drawingItems={drawingItemsRef.current}
                drawingItems={drawingItems}
                setDrawingItems={setDrawingItems}
                drawingItemRef={drawingItemRef}
                pointNumberRef={pointNumberRef}
                appRef={appRef}
            />
        </div>
    );
}
