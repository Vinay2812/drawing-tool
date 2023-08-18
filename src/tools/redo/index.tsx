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
        appRef,
        pointNumberRef,
    } = args;
    setDrawingItems((prev) => {
        return [...prev, undoItems[undoItems.length - 1]];
    });
    setUndoItems((prev) => prev.slice(0, prev.length - 1));
    resetGraphics(graphicsStoreRef, pointNumberRef, appRef);
};
