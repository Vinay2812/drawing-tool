import { HTMLAttributes } from "react";

/* eslint-disable react-refresh/only-export-components */
export * from "./renderers";
export * as events from "./events";
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
