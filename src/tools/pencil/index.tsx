/* eslint-disable react-refresh/only-export-components */
import { HTMLAttributes } from "react";
import { renderPencilGraphics } from "./renderers";
import { OnClickArgs, PointerEvents } from "..";
export * from "./renderers";

export const toolName = "pencil";
export const renderer = renderPencilGraphics;
import * as events from "./events";
export const Icon = (props: HTMLAttributes<SVGElement>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
        </svg>
    );
};
export const onClick = (args: OnClickArgs) => {
    args.setActiveTool("pencil");
};
export const isLeft = true;
export const cursor = "cursor-default";

export const config = {
    name: toolName as "pencil",
    renderer,
    events: events as PointerEvents,
    Icon,
    onClick,
    isLeft,
    cursor,
};
export type PencilConfig = typeof config;
