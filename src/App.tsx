import DrawingArea, { DrawingAreaConfig } from "./components/DrawingArea";
import "./index.css";

export default function App() {
    const props: DrawingAreaConfig = {
        canvasHeight: 600,
        canvasWidth: Math.min(window.innerWidth, 800),
        gridSize: 50,
        hiddenTools: ["circle"],
        unit: "mm",
        showSubGrid: false,
    };
    return <DrawingArea {...props} />;
}
