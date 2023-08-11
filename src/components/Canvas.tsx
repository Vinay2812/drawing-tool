import * as PIXI from "pixi.js";
import { tools } from "../tools";
import { DrawingItem, Line, Point } from "./DrawingArea";
import { useEffect, useRef } from "react";
import {
    findPointAtDistance,
    getAngleBetweenLines,
    getCommonPoint,
    getDistance,
    isSamePoint,
    getClosestPoint,
    roundupNumber,
    findParallelogramFourthPoint,
    findPointParallelToLine,
} from "../tools/line/calculations";

type Props = {
    activeTool: keyof typeof tools;
    drawingItems: DrawingItem[];
    setDrawingItems: React.Dispatch<React.SetStateAction<DrawingItem[]>>;
};

export default function Canvas({ drawingItems, setDrawingItems }: Props) {
    const appRef = useRef<PIXI.Application<HTMLCanvasElement> | null>(null);
    const containerRef = useRef<HTMLElement | null>(null);

    const GRID_UNIT = 50;

    const startPoint = useRef<Point | null>(null);
    const setStartPoint = (point: Point | null) => (startPoint.current = point);
    const isDrawing = useRef(false);
    const setIsDrawing = (val: boolean) => (isDrawing.current = val);

    const textGraphicsOptions: Partial<PIXI.ITextStyle> | PIXI.TextStyle = {
        fontSize: 18,
        fill: "white",
        fontWeight: "500",
    };
    const graphics = new PIXI.Graphics();
    const textGraphics = new PIXI.Text("", textGraphicsOptions);
    // const angleTextGraphics = new PIXI.Text("", textGraphicsOptions);

    const itemsRef = useRef(drawingItems);

    function renderCircle(
        graphics: PIXI.Graphics,
        point: Point,
        radius: number,
        color: string,
    ) {
        graphics.beginFill(color);
        graphics.drawCircle(point.x, point.y, radius);
        graphics.endFill();
    }

    function renderLine(graphics: PIXI.Graphics, line: Line, color: string) {
        const { start, end } = line;
        graphics.lineStyle(3, color, 1, 1);
        graphics.moveTo(start.x, start.y);
        graphics.lineTo(end.x, end.y);
        renderCircle(graphics, start, 3, color);
        renderCircle(graphics, end, 3, color);
    }

    function renderDistanceOnLine(textGraphics: PIXI.Text, line: Line) {
        const { start, end } = line;
        const distance = getDistance(start, end);
        const p = findPointParallelToLine(line, GRID_UNIT / 2);
        renderCircle(graphics, p, 3, "blue");
        textGraphics.x = p.x;
        textGraphics.y = p.y - 10;
        textGraphics.text = `${roundupNumber(distance / GRID_UNIT)}`;
    }

    function renderAngleBetweenLines(lines: Line[]) {
        const app = appRef.current!;
        for (let i = 0; i < lines.length; i++) {
            for (let j = i + 1; j < lines.length; j++) {
                if (i === j) continue;
                let line1 = lines[i];
                let line2 = lines[j];
                const commonPoint = getCommonPoint(line1, line2);
                if (!commonPoint) continue;
                if (
                    line1.end.x === commonPoint.x &&
                    line1.end.y === commonPoint.y
                ) {
                    line1 = {
                        start: line1.end,
                        end: line1.start,
                    };
                }
                if (
                    line2.end.x === commonPoint.x &&
                    line2.end.y === commonPoint.y
                ) {
                    line2 = {
                        start: line2.end,
                        end: line2.start,
                    };
                }

                const angleDegrees = getAngleBetweenLines(line1, line2);
                if (angleDegrees === -1) {
                    continue;
                }
                // console.log(`line${i + 1}-line${j + 1}-${angleDegrees}`);
                const line1Length = getDistance(line1.start, line1.end);
                const line2Length = getDistance(line2.start, line2.end);
                const gap = Math.min(
                    Math.max(line1Length, line2Length) / 4,
                    (GRID_UNIT * 75) / angleDegrees,
                );

                const arcStartPoint = findPointAtDistance(line1, gap);
                const arcEndPoint = findPointAtDistance(line2, gap);
                const graphics = new PIXI.Graphics();
                // const controlPoint = getMidpoint(arcStartPoint, arcEndPoint);
                const controlPoint = findParallelogramFourthPoint(
                    [commonPoint, arcStartPoint, arcEndPoint],
                    0,
                );
                if (!controlPoint) continue;
                // renderCircle(graphics, controlPoint, 6, "blue");

                // Create a Graphics object to draw the arc
                graphics.lineStyle(3, "whitesmoke", 1, 1);

                // Draw the arc
                graphics.moveTo(arcStartPoint.x, arcStartPoint.y);
                graphics.quadraticCurveTo(
                    controlPoint.x,
                    controlPoint.y,
                    arcEndPoint.x,
                    arcEndPoint.y,
                );

                const angleTextGraphics = new PIXI.Text(
                    "",
                    textGraphicsOptions,
                );
                angleTextGraphics.x = controlPoint.x - 10;
                angleTextGraphics.y = controlPoint.y - 10;
                angleTextGraphics.text = `${roundupNumber(angleDegrees, 0)}°`;

                // Add the arc and angle to the stage
                app.stage.addChild(graphics);
                app.stage.addChild(angleTextGraphics);
            }
        }
    }

    function renderLineWithMeasurements({ start, end }: Line) {
        const lineGraphics = new PIXI.Graphics();
        renderLine(lineGraphics, { start, end }, "red");
        // const textGraphics = new PIXI.Text("", textGraphicsOptions);
        renderDistanceOnLine(textGraphics, { start, end });
        appRef.current!.stage.addChild(lineGraphics);
        appRef.current!.stage.addChild(textGraphics);
    }

    function getMousePos(event: MouseEvent) {
        const pos = { x: 0, y: 0 };
        if (containerRef.current) {
            // Get the position and size of the component on the page.
            const holderOffset = containerRef.current.getBoundingClientRect();
            pos.x = event.pageX - holderOffset.x;
            pos.y = event.pageY - holderOffset.y;
        }
        return pos;
    }

    function getPointsFromLines(lines: Line[]) {
        return lines.reduce((prev, line) => {
            return [...prev, line.start, line.end];
        }, [] as Point[]);
    }

    function addNewLine(start: Point, end: Point) {
        const linePoints = getPointsFromLines(
            itemsRef.current.map((item) => item.data),
        );
        const updatedStart = getClosestPoint(start, linePoints);
        const updatedEnd = getClosestPoint(end, linePoints);
        if (!isSamePoint(updatedStart, updatedEnd))
            setDrawingItems((prev) => [
                ...prev,
                {
                    type: "line",
                    data: {
                        start: updatedStart,
                        end: updatedEnd,
                    },
                },
            ]);
    }

    function onDown(e: MouseEvent) {
        setStartPoint(getMousePos(e));
        setIsDrawing(true);
    }

    function onMove(e: MouseEvent) {
        if (!startPoint.current || !isDrawing.current) return;
        const end = getMousePos(e);
        const start = startPoint.current;
        graphics.clear();
        renderLine(graphics, { start, end }, "green");
        appRef.current!.stage.removeChild(textGraphics);
        renderDistanceOnLine(textGraphics, { start, end });
        appRef.current!.stage.addChild(textGraphics);
        appRef.current!.stage.addChild(graphics);
    }

    function onUp(e: MouseEvent) {
        if (!startPoint.current || !isDrawing.current) return;
        graphics.clear();
        textGraphics.text = "";
        appRef.current!.stage.removeChild(textGraphics);
        const start = startPoint.current;
        const end = getMousePos(e);
        addNewLine(start, end);
        setIsDrawing(false);
    }

    useEffect(() => {
        if (!appRef.current) {
            containerRef.current = document.getElementById("canvas-container")!;
            // const { width } = containerRef.current.getBoundingClientRect();
            appRef.current = new PIXI.Application<HTMLCanvasElement>({
                width: window.innerWidth,
                height: window.innerHeight,
                backgroundColor: "transparent", // Background color
                backgroundAlpha: 0,
                resolution: window.devicePixelRatio || 1,
            });
            const gridGraphics = new PIXI.Graphics();
            appRef.current.stage.addChild(gridGraphics);

            // Grid properties
            const gridSize = GRID_UNIT;
            const gridColor = 0xaaaaaa; // Grid line color
            const gridAlpha = 0.5; // Grid line opacity

            // Draw the grid lines
            for (let x = 0; x < appRef.current.renderer.width; x += gridSize) {
                gridGraphics.lineStyle(1, gridColor, gridAlpha);
                gridGraphics.moveTo(x, 0);
                gridGraphics.lineTo(x, appRef.current.renderer.height);
            }

            for (let y = 0; y < appRef.current.renderer.height; y += gridSize) {
                gridGraphics.lineStyle(1, gridColor, gridAlpha);
                gridGraphics.moveTo(0, y);
                gridGraphics.lineTo(appRef.current.renderer.width, y);
            }

            // Render the stage
            appRef.current.renderer.render(appRef.current.stage);
            containerRef.current.appendChild(appRef.current.view);
        }

        const container = containerRef.current!;
        if (!container) return;
        container.addEventListener("mousedown", onDown);
        container.addEventListener("mousemove", onMove);
        container.addEventListener("mouseup", onUp);

        return () => {
            container.removeEventListener("mousedown", onDown);
            container.removeEventListener("mousemove", onMove);
            container.removeEventListener("mouseup", onUp);
            containerRef.current?.remove();
        };
    }, []);

    useEffect(() => {
        // const points = getPointsFromLines(drawingItems);
        itemsRef.current = drawingItems;
        drawingItems.forEach((item) => {
            renderLineWithMeasurements(item.data);
            renderAngleBetweenLines(drawingItems.map((item) => item.data));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawingItems]);
    return <div></div>;
}
