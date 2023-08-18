import { HTMLAttributes } from "react";

/* eslint-disable react-refresh/only-export-components */
export * from "./renderer";
export * as events from "./events";

export const Icon = (props: HTMLAttributes<SVGElement>) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="black"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <circle cx="12" cy="12" r="10" />
    </svg>
);
