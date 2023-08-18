import * as lineTool from "./line";
import * as selectTool from "./select";
import * as circleTool from "./circle";
import * as clearTool from "./clear";
import * as undoTool from "./undo";
import * as redoTool from "./redo";
import { ToolboxProps } from "../components/Toolbox";
export type OnClickArgs = ToolboxProps;

export const tools = {
    select: {
        renderer: () => null,
        icon: selectTool.Icon,
        events: selectTool.events,
        cursor: "cursor-move",
        onClick: selectTool.onClick,
        isLeft: true,
    },
    line: {
        renderer: lineTool.renderLineWithMeasurements,
        icon: lineTool.Icon,
        events: lineTool.events,
        cursor: "cursor-crosshair",
        onClick: lineTool.onClick,
        isLeft: true,
    },
    circle: {
        renderer: circleTool.renderCircleWithMeasurements,
        icon: circleTool.Icon,
        events: circleTool.events,
        cursor: "cursor-crosshair",
        onClick: circleTool.onClick,
        isLeft: true,
    },
    undo: {
        renderer: undoTool.renderer,
        icon: undoTool.icon,
        events: undoTool.events,
        cursor: "cursor-pointer",
        onClick: undoTool.onClick,
        isLeft: false,
    },
    redo: {
        renderer: redoTool.renderer,
        icon: redoTool.icon,
        events: redoTool.events,
        cursor: "cursor-pointer",
        onClick: redoTool.onClick,
        isLeft: false,
    },
    clear: {
        renderer: clearTool.renderer,
        icon: clearTool.icon,
        events: clearTool.events,
        cursor: "cursor-pointer",
        onClick: clearTool.onClick,
        isLeft: false,
    },
};
export type Tools = typeof tools;
export type ToolsType = keyof typeof tools;
