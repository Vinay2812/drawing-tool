/* eslint-disable react-refresh/only-export-components */
import { HTMLAttributes } from "react";
import { OnClickArgs, PointerEvents } from "..";
import { renderLineWithMeasurements } from "./renderers";

export const toolName = "line";
export const renderer = renderLineWithMeasurements;
import * as events from "./events";
export const Icon = (props: HTMLAttributes<SVGElement>) => (
    <svg height="24" width="24" {...props}>
        <circle cx="5" cy="5" r="1.5" fill={props.style?.stroke ?? "none"} />
        <circle cx="20" cy="20" r="1.5" fill={props.style?.stroke ?? "none"} />
        <line
            x1="5"
            y1="5"
            x2="20"
            y2="20"
            style={{
                strokeWidth: 2,
            }}
        />
    </svg>
);
export const onClick = (args: OnClickArgs) => {
    args.setActiveTool("line");
};
export const isLeft = true;
export const cursor = "cursor-crosshair";

export const config = {
    name: toolName as "line",
    renderer,
    events: events as PointerEvents,
    Icon,
    onClick,
    isLeft,
    cursor,
};
export type LineConfig = typeof config;

export * from "./renderers";
