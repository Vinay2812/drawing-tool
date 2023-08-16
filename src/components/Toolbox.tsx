import { SmoothGraphics } from "@pixi/graphics-smooth";
import { type ToolsType, tools } from "../tools";
import * as PIXI from "pixi.js";
import { DrawingItem } from "./DrawingArea";

type Props = {
    activeTool: ToolsType;
    setActiveTool: React.Dispatch<React.SetStateAction<ToolsType>>;
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >;
    pointNumberRef: React.MutableRefObject<number>;
    appRef: React.MutableRefObject<PIXI.Application<HTMLCanvasElement> | null>;
};

export default function Toolbox(props: Props) {
    return (
        <div className="flex gap-2 px-4 py-2 w-screen h-fit bg-zinc-300">
            {Object.entries(tools).map(([toolName, tool]) => {
                return (
                    <button
                        key={toolName}
                        onClick={() =>
                            tools[toolName as ToolsType].onClick(props)
                        }
                        className={`text-white p-2 cursor-pointer ${
                            props.activeTool === toolName
                                ? "bg-white"
                                : "bg-transparent"
                        }`}
                    >
                        {tool.icon}
                    </button>
                );
            })}
        </div>
    );
}
