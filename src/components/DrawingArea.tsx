import Toolbox from "./Toolbox";
import { lazy, useState } from "react";
import { type ToolsType } from "../tools";
import Line from "../tools/line";
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
    return (
        <div className="flex flex-row">
            <Toolbox activeTool={activeTool} setActiveTool={setActiveTool} />
            <div id="canvas-container" className="w-auto overflow-hidden cursor-crosshair bg-slate-950" />
            <Canvas
                activeTool={activeTool}
                // drawingItems={drawingItemsRef.current}
                drawingItems={drawingItems}
                setDrawingItems={setDrawingItems}
            />
        </div>
    );
}
