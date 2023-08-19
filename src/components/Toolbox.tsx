import { SmoothGraphics } from "@pixi/graphics-smooth";
import { type ToolsType, tools } from "../tools";
import * as PIXI from "pixi.js";
import { DrawingItem } from "./DrawingArea";
import { isMobile } from "../tools/utils/config";

export type ToolboxProps = {
    activeTool: ToolsType;
    setActiveTool: React.Dispatch<React.SetStateAction<ToolsType>>;
    drawingItems: DrawingItem[];
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
    undoItems: DrawingItem[];
    setUndoItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >;
    pointNumberRef: React.MutableRefObject<number>;
    appRef: React.MutableRefObject<PIXI.Application<HTMLCanvasElement> | null>;
};

export default function Toolbox(
    props: ToolboxProps & React.HTMLAttributes<HTMLDivElement>,
) {
    const leftTools = Object.entries(tools).filter((tool) => {
        return tool[1].isLeft;
    });
    const rightTools = Object.entries(tools).filter((tool) => {
        return !tool[1].isLeft;
    });
    function isToolDisabled(toolName: ToolsType) {
        const { undoItems, drawingItems } = props;
        if (drawingItems.length === 0 && undoItems.length === 0) return true;
        if (toolName === "redo") return undoItems.length === 0;

        return drawingItems.length === 0;
    }
    return (
        <div {...props}>
            <div className="border border-gray-500 flex">
                {leftTools.map(([toolName, tool], idx) => {
                    const Icon = tool.Icon;
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
            <div className="flex gap-2">
                {rightTools.map(([toolName, tool]) => {
                    const Icon = tool.Icon;
                    const isActive = props.activeTool === toolName;
                    const disabled = isToolDisabled(toolName as ToolsType);
                    return (
                        <button
                            key={toolName}
                            disabled={disabled}
                            onClick={() =>
                                tools[toolName as ToolsType].onClick(props)
                            }
                            className={`text-white p-2 mx-1 cursor-pointer border-gray-500 outline outline-2 ${!isMobile() && "hover:outline-gray-200 hover:bg-gray-200 hover:rounded-full"} ${
                                isActive ? "bg-white" : "bg-transparent"
                            } ${
                                disabled &&
                                "disabled:cursor-not-allowed disabled:bg-transparent disabled:outline-none"
                            }`}
                        >
                            <Icon
                                // className="text-white"
                                style={{
                                    stroke:
                                        toolName === "clear"
                                            ? disabled
                                                ? "tomato"
                                                : "red"
                                            : disabled
                                            ? "gray"
                                            : "black",
                                }}
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
