import { HTMLAttributes } from "react";
import { OnClickArgs } from "..";
import { resetGraphics } from "../utils/helpers";

export const renderer = () => {};
export const events = {
    onMove: () => {},
    onDown: () => {},
    onUp: () => {},
};
export const icon = (props: HTMLAttributes<SVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="red"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        {...props}
    >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
    </svg>
);

export const onClick = ({
    setDrawingItems,
    setUndoItems,
    graphicsStoreRef,
    pointNumberRef,
    appRef,
}: OnClickArgs) => {
    setDrawingItems([]);
    setUndoItems([]);
    resetGraphics(graphicsStoreRef, pointNumberRef, appRef);
};
