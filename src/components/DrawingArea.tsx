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

function useRefState<T>(initialValue: T) {
    const stateRef = useRef(initialValue);

    const setState = (newValue: T) => {
        if (typeof newValue === "function") {
            stateRef.current = newValue(stateRef.current);
        } else {
            stateRef.current = newValue;
        }
    };

    return [stateRef.current, setState];
}

export default function DrawingArea() {
    const [activeTool, setActiveTool] = useState<ToolsType>("line");
    const [drawingItems, setDrawingItems] = useState<DrawingItem[]>([]);


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
            />
        </div>
    );
}
