/* eslint-disable react-refresh/only-export-components */
import { HTMLAttributes } from "react";
import { OnClickArgs, PointerEvents } from "..";

export const toolName = "select";
export const renderer = () => {};
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
        <path d="M22 14a8 8 0 0 1-8 8" />
        <path d="M18 11v-1a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <path d="M14 10V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v1" />
        <path d="M10 9.5V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v10" />
        <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
);

export const onClick = (args: OnClickArgs) => {
    args.setActiveTool("select");
};
export const isLeft = true;
export const cursor = "cursor-move";

export const config = {
    name: toolName as "select",
    renderer,
    events: events as PointerEvents,
    Icon,
    onClick,
    isLeft,
    cursor,
};
export type SelectConfig = typeof config;
