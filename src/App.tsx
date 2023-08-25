import DrawingTool, {
    DrawingToolConfig,
    DrawingItem,
} from "./components/drawing-tool";
import "./index.css";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultTriangle: DrawingItem[] = [
    {
        id: 1,
        type: "line",
        data: {
            shapeId: 1,
            start: {
                x: 135,
                y: 298,
            },
            end: {
                x: 324,
                y: 151,
            },
        },
    },
    {
        id: 2,
        type: "line",
        data: {
            shapeId: 2,
            start: {
                x: 324,
                y: 151,
            },
            end: {
                x: 491,
                y: 320,
            },
        },
    },
    {
        id: 3,
        type: "line",
        data: {
            shapeId: 3,
            start: {
                x: 135,
                y: 298,
            },
            end: {
                x: 491,
                y: 320,
            },
        },
    },
];

export default function App() {
    const props: DrawingToolConfig = {
        canvasHeight: 600,
        canvasWidth: Math.min(window.innerWidth, 800),
        gridSize: 50,
        hiddenTools: [],
        unit: "mm",
        showSubGrid: false,
        // defaultDrawingItems: [...defaultTriangle],
    };
    return <DrawingTool {...props} />;
}
