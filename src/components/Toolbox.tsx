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
} & React.HTMLAttributes<HTMLDivElement>;

export default function Toolbox(props: Props) {
    const leftTools = Object.entries(tools).filter(([_, { isLeft }]) => {
        return isLeft;
    });
    const rightTools = Object.entries(tools).filter(([_, { isLeft }]) => {
        return !isLeft;
    });
    return (
        <div {...props}>
            <div className="border border-gray-500 flex">
                {leftTools.map(([toolName, tool], idx) => {
                    const Icon = tool.icon;
                    const isActive = props.activeTool === toolName;
                    return (
                        <button
                            key={toolName}
                            onClick={() =>
                                tools[toolName as ToolsType].onClick(props)
                            }
                            className={`text-white py-2 px-4 cursor-pointer hover:!outline hover:z-10 outline-purple-700 ${
                                isActive ? "bg-cyan-600" : "bg-transparent"
                            } border-gray-500 ${idx > 0 && "border-l"} `}
                        >
                            <Icon
                                className="text-white"
                                style={{ stroke: isActive ? "white" : "black" }}
                            />
                        </button>
                    );
                })}
            </div>
            <div className="flex">
                {rightTools.map(([toolName, tool]) => {
                    const Icon = tool.icon;
                    return (
                        <button
                            key={toolName}
                            onClick={() =>
                                tools[toolName as ToolsType].onClick(props)
                            }
                            className={`text-white p-2 cursor-pointer border-gray-500 outline outline-4 hover:outline-gray-200 hover:bg-gray-200 hover:rounded-full ${
                                props.activeTool === toolName
                                    ? "bg-white"
                                    : "bg-transparent"
                            }`}
                        >
                            <Icon
                                // className="text-white"
                                style={{
                                    stroke:
                                        toolName === "clear" ? "red" : "black",
                                }}
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
