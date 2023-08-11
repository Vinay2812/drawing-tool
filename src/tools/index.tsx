import Line from "./line";

export const tools = {
    line: {
        renderer: Line,
        icon: (
            <svg height="20" width="20">
                <line
                    x1="0"
                    y1="0"
                    x2="200"
                    y2="200"
                    style={{
                        stroke: "#000",
                        strokeWidth: 2,
                    }}
                />
            </svg>
        ),
    },
};

export type ToolsType = keyof typeof tools;
