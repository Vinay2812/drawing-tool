import { HTMLAttributes } from "react";
import { OnClickArgs, PointerEvents } from "..";
import { resetGraphics } from "../utils/helpers";

export const toolName = "redo";
export const renderer = () => {};
export const events = {
    onMove: () => {},
    onDown: () => {},
    onUp: () => {},
};
export const Icon = (props: HTMLAttributes<SVGElement>) => (
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
        <path d="M21 7v6h-6" />
        <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
    </svg>
);

export const onClick = (args: OnClickArgs) => {
    const {
        setDrawingItems,
        setUndoItems,
        undoItems,
        graphicsStoreRef,
        viewportRef,
        pointNumberRef,
    } = args;
    setDrawingItems((prev) => {
        return [...prev, undoItems[undoItems.length - 1]];
    });
    setUndoItems((prev) => prev.slice(0, prev.length - 1));
    resetGraphics(graphicsStoreRef, pointNumberRef, viewportRef);
};

export const isLeft = false;
export const cursor = "cursor-pointer";

export const config = {
    name: toolName as "redo",
    renderer,
    events: events as PointerEvents,
    Icon,
    onClick,
    isLeft,
    cursor,
};
export type RedoConfig = typeof config;
