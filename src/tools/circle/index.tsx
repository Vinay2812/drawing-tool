/* eslint-disable react-refresh/only-export-components */
import { HTMLAttributes } from "react";
import { OnClickArgs, PointerEvents } from "..";
import { renderCircleWithMeasurements } from "./renderer";

export const toolName = "circle";
export const renderer = renderCircleWithMeasurements;
import * as events from "./events";

export const Icon = (props: HTMLAttributes<SVGElement>) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10" />
    </svg>
);
export const onClick = (args: OnClickArgs) => {
    args.setActiveTool("circle");
};
export const isLeft = true;
export const cursor = "cursor-crosshair";

export const config = {
    name: toolName as "circle",
    renderer,
    events: events as PointerEvents,
    Icon,
    onClick,
    isLeft,
    cursor,
};
export type CircleConfig = typeof config;
export * from "./renderer";
