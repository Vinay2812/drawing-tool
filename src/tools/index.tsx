import * as lineTool from "./line";
import * as selectTool from "./select";
import * as circleTool from "./circle";
import * as clearTool from "./clear";
import * as undoTool from "./undo";
import * as redoTool from "./redo";
import * as pencilTool from "./pencil";
import { ToolboxProps } from "../components/Toolbox";
import { PointerEventsProps } from "../components/Canvas";
export type OnClickArgs = ToolboxProps;

export type PointerEvents = {
    onDown: (e: MouseEvent, others: PointerEventsProps) => void;
    onMove: (e: MouseEvent, others: PointerEventsProps) => void;
    onUp: (e: MouseEvent, others: PointerEventsProps) => void;
};

export const tools = {
    [selectTool.config.name]: selectTool.config,
    [pencilTool.config.name]: pencilTool.config,
    [lineTool.config.name]: lineTool.config,
    [circleTool.config.name]: circleTool.config,
    [undoTool.config.name]: undoTool.config,
    [redoTool.config.name]: redoTool.config,
    [clearTool.config.name]: clearTool.config,
};

export type ToolsType = keyof typeof tools;

type Unpacked<T> = T extends (infer U)[] ? U : T;
const toolsValue = Object.values(tools)
export type Tools = Record<ToolsType, Unpacked<typeof toolsValue>>