// import Line from "./line";
import * as lineTool from "./line";
import * as selectTool from "./select";
export const tools = {
    line: {
        renderer: lineTool.renderLineWithMeasurements,
        icon: lineTool.Icon,
        events: lineTool.events,
        cursor: "cursor-crosshair"
    },
    select: {
        renderer: () => null,
        icon: selectTool.Icon,
        events: selectTool.events,
        cursor: "cursor-move"
    },
};
export type Tools = typeof tools;
export type ToolsType = keyof typeof tools;
