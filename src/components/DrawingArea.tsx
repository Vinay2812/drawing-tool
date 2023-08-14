import * as PIXI from "pixi.js";
import Toolbox from "./Toolbox";
import { lazy, useRef, useState } from "react";
import { tools, type ToolsType } from "../tools";
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
    const [activeTool, setActiveTool] = useState<ToolsType>("line");
    const [drawingItems, setDrawingItems] = useState<DrawingItem[]>([]);
    const drawingItemRef = useRef<
        Record<string, Array<PIXI.Graphics | PIXI.Text>>
    >({});
    const pointNumberRef = useRef<number>(0);
    return (
        <div className="flex flex-row">
            <Toolbox activeTool={activeTool} setActiveTool={setActiveTool} />
            <div
                id="canvas-container"
                className={`w-auto overflow-hidden ${tools[activeTool].cursor} bg-slate-950`}
            />
            <Canvas
                activeTool={activeTool}
                // drawingItems={drawingItemsRef.current}
                drawingItems={drawingItems}
                setDrawingItems={setDrawingItems}
                drawingItemRef={drawingItemRef}
                pointNumberRef={pointNumberRef}
            />
        </div>
    );
}
