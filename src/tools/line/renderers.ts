import * as PIXI from "pixi.js";
import {
    DrawingItem,
    type Line,
    type Point,
} from "../../components/DrawingArea";
import {
    findParallelogramFourthPoint,
    findPointAtDistance,
    getAngleBetweenLines,
    getCommonPoint,
    getDistance,
    getLabelPosition,
    isSamePoint,
    roundupNumber,
    slope,
} from "./calculations";
import { GRID_UNIT, textGraphicsOptions } from "../config";

export function renderCircle(
    graphics: PIXI.Graphics,
    point: Point,
    radius: number,
    color: string,
) {
    graphics.beginFill(color);
    graphics.drawCircle(point.x, point.y, radius);
    graphics.endFill();
    if (graphics.onclick)
        graphics.onclick = () => {
            console.log("selected", point);
        };
}

export function renderLine(graphics: PIXI.Graphics, line: Line, color: string) {
    const { start, end } = line;
    graphics.lineStyle(3, color, 1, 0.5);

    graphics.moveTo(start.x, start.y);
    graphics.lineTo(end.x, end.y);
    renderCircle(graphics, start, 4, color);
    renderCircle(graphics, end, 4, color);
}

export function renderDistanceOnLine(textGraphics: PIXI.Text, line: Line) {
    const { start, end } = line;
    const distance = getDistance(start, end);
    const s = slope(line.start, line.end);
    let p1 = start;
    let p2 = end;
    if (s < 0) {
        p1 = end;
        p2 = start;
    }
    const p = getLabelPosition(p1, p2, GRID_UNIT / 3);
    const angle = Math.atan(s);
    textGraphics.rotation = angle;
    // renderCircle(graphics, p, 3, "blue");
    textGraphics.x = p.x;
    textGraphics.y = p.y;
    textGraphics.text = `${roundupNumber(distance / GRID_UNIT)} cm`;
}

export function renderLineWithMeasurements(
    line: Line,
    app: PIXI.Application<HTMLCanvasElement>,
    lineGraphics?: PIXI.Graphics,
    textGraphics?: PIXI.Text,
) {
    const { start, end } = line;
    if (!lineGraphics) lineGraphics = new PIXI.Graphics();
    if (!textGraphics) textGraphics = new PIXI.Text("", textGraphicsOptions);
    renderLine(lineGraphics, { start, end }, "red");
    // const textGraphics = new PIXI.Text("", textGraphicsOptions);
    renderDistanceOnLine(textGraphics, { start, end });
    app.stage.addChild(lineGraphics);
    app.stage.addChild(textGraphics);
}

export function renderAngleBetweenLines(
    lines: Line[],
    app: PIXI.Application<HTMLCanvasElement>,
    graphics?: PIXI.Graphics,
    angleTextGraphics?: PIXI.Text,
) {
    for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            if (i === j) continue;
            let line1 = lines[i];
            let line2 = lines[j];
            const commonPoint = getCommonPoint(line1, line2);
            if (!commonPoint) continue;
            if (isSamePoint(line1.end, commonPoint)) {
                line1 = {
                    start: line1.end,
                    end: line1.start,
                };
            }
            if (isSamePoint(line2.end, commonPoint)) {
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
                Math.min(line1Length, line2Length) / 4,
                (GRID_UNIT * GRID_UNIT * 0.5) / angleDegrees,
            );

            const arcStartPoint = findPointAtDistance(line1, gap);
            const arcEndPoint = findPointAtDistance(line2, gap);
            let g = graphics;
            if (!g) g = new PIXI.Graphics();
            // const controlPoint = getMidpoint(arcStartPoint, arcEndPoint);
            const controlPoint = findParallelogramFourthPoint(
                [commonPoint, arcStartPoint, arcEndPoint],
                0,
            );
            if (!controlPoint) continue;
            // renderCircle(graphics, controlPoint, 6, "blue");

            // Create a Graphics object to draw the arc
            g.lineStyle(3, "white", 1, 1);

            // Draw the arc
            g.moveTo(arcStartPoint.x, arcStartPoint.y);
            g.quadraticCurveTo(
                controlPoint.x,
                controlPoint.y,
                arcEndPoint.x,
                arcEndPoint.y,
            );

            let atg = angleTextGraphics;
            if (!atg) atg = new PIXI.Text("", textGraphicsOptions);
            atg.x = controlPoint.x - 10;
            atg.y = controlPoint.y - 10;
            atg.text = `${roundupNumber(angleDegrees, 0)}°`;

            // Add the arc and angle to the stage
            app.stage.addChild(g);
            app.stage.addChild(atg);
        }
    }
}

export function renderNewLine(
    start: Point,
    end: Point,
    setDrawingItems: (value: React.SetStateAction<DrawingItem[]>) => void,
) {
    if (!isSamePoint(start, end))
        setDrawingItems((prev) => [
            ...prev,
            {
                type: "line",
                data: {
                    start,
                    end,
                },
            },
        ]);
}
