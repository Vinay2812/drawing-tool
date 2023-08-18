// import Line from "./line";
import { SmoothGraphics } from "@pixi/graphics-smooth";
import { DrawingItem } from "../components/DrawingArea";
import * as lineTool from "./line";
import * as selectTool from "./select";
import * as circleTool from "./circle";
import * as PIXI from "pixi.js";
import { HTMLAttributes } from "react";

type OnClickArgs = {
    activeTool: ToolsType;
    setActiveTool: React.Dispatch<React.SetStateAction<ToolsType>>;
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >;
    pointNumberRef: React.MutableRefObject<number>;
    appRef: React.MutableRefObject<PIXI.Application<HTMLCanvasElement> | null>;
};

export const tools = {
    select: {
        renderer: () => null,
        icon: selectTool.Icon,
        events: selectTool.events,
        cursor: "cursor-move",
        onClick: (args: OnClickArgs) => {
            args.setActiveTool("select");
        },
        isLeft: true,
    },
    line: {
        renderer: lineTool.renderLineWithMeasurements,
        icon: lineTool.Icon,
        events: lineTool.events,
        cursor: "cursor-crosshair",
        onClick: (args: OnClickArgs) => {
            args.setActiveTool("line");
        },
        isLeft: true,
    },
    circle: {
        renderer: circleTool.renderCircleWithMeasurements,
        icon: circleTool.Icon,
        events: circleTool.events,
        cursor: "cursor-crosshair",
        onClick: (args: OnClickArgs) => {
            args.setActiveTool("circle");
        },
        isLeft: true,
    },
    clear: {
        renderer: () => null,
        icon: (props: HTMLAttributes<SVGElement>) => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="red"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                {...props}
            >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
            </svg>
        ),

        events: {
            onMove: () => {},
            onDown: () => {},
            onUp: () => {},
        },
        cursor: "cursor-pointer",
        onClick: ({
            setDrawingItems,
            graphicsStoreRef,
            pointNumberRef,
            appRef,
        }: OnClickArgs) => {
            setDrawingItems([]);
            Object.keys(graphicsStoreRef.current).forEach((key) => {
                graphicsStoreRef.current[key].forEach((g) => {
                    if (appRef.current) {
                        appRef.current.stage.removeChild(g);
                    }
                });
            });
            pointNumberRef.current = 0;
        },
        isLeft: false,
    },
};
export type Tools = typeof tools;
export type ToolsType = keyof typeof tools;
