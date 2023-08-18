import { HTMLAttributes } from "react";
import { OnClickArgs } from "..";
import { resetGraphics } from "../utils/helpers";

export const events = {
    onMove: () => {},
    onDown: () => {},
    onUp: () => {},
};

export const renderer = () => {};

export const icon = (props: HTMLAttributes<SVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        {...props}
    >
        <path d="M3 7v6h6" />
        <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
);

export const onClick = (args: OnClickArgs) => {
    const {
        setDrawingItems,
        setUndoItems,
        graphicsStoreRef,
        appRef,
        pointNumberRef,
        drawingItems,
    } = args;
    setUndoItems((prev) => {
        return [...prev, drawingItems[drawingItems.length - 1]];
    });
    setDrawingItems((prev) => {
        if (!prev.length) return [];
        return prev.slice(0, prev.length - 1);
    });
    resetGraphics(graphicsStoreRef, pointNumberRef, appRef);
};
