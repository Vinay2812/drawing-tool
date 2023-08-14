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
    getPointNamePosition,
    isSamePoint,
    roundupNumber,
    slope,
} from "./calculations";
import { GRID_UNIT, textGraphicsOptions } from "../config";
import { areSameLines } from "../select/calculations";

export function renderCircle(
    graphics: PIXI.Graphics,
    point: Point,
    radius: number,
    color: string,
) {
    graphics.beginFill(color);
    graphics.drawCircle(point.x, point.y, radius);
    graphics.endFill();
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
    const p1 = start;
    const p2 = end;
    const s = slope(p1, p2);
    // if (s < 0) {
    //     p1 = end;
    //     p2 = start;
    //     s = slope(p1, p2)
    // }
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
    drawingItemRef: React.MutableRefObject<
        Record<string, (PIXI.Graphics | PIXI.Text)[]>
    >,
    lineGraphics?: PIXI.Graphics,
    textGraphics?: PIXI.Text,
) {
    const { start, end } = line;
    if (!lineGraphics) lineGraphics = new PIXI.Graphics();
    if (!textGraphics) textGraphics = new PIXI.Text("", textGraphicsOptions);
    const key = `${JSON.stringify(start)}-${JSON.stringify(end)}`;
    if (!drawingItemRef.current[key]) {
        {
            drawingItemRef.current[key] = [];
        }
    } else {
        drawingItemRef.current[key].forEach((item) => {
            app.stage.removeChild(item);
        });
        drawingItemRef.current[key] = [];
    }
    drawingItemRef.current[key].push(lineGraphics);
    drawingItemRef.current[key].push(textGraphics);
    renderLine(lineGraphics, { start, end }, "red");
    // const textGraphics = new PIXI.Text("", textGraphicsOptions);
    renderDistanceOnLine(textGraphics, { start, end });
    app.stage.addChild(lineGraphics);
    app.stage.addChild(textGraphics);
}

export function renderPointName(
    line: Line,
    drawingItemRef: React.MutableRefObject<
        Record<string, (PIXI.Graphics | PIXI.Text)[]>
    >,
    app: PIXI.Application<HTMLCanvasElement>,
) {
    const pointLabelKey = `point-${JSON.stringify(line.start)}`;
    let pointLabelGraphics = new PIXI.Text("A", textGraphicsOptions);
    if (drawingItemRef.current[pointLabelKey]) {
        pointLabelGraphics = drawingItemRef.current[
            pointLabelKey
        ][0] as PIXI.Text;
        app.stage.removeChild(pointLabelGraphics);
    } else {
        // console.log(pointLabelKey, labelIdx, labels[labelIdx]);
        drawingItemRef.current[pointLabelKey] = [pointLabelGraphics];
        // pointLabelGraphics.text = labels[labelIdx];
        // labelIdx = labelIdx + 1;
    }

    const p3 = getPointNamePosition(line.end, line.start, 10);
    pointLabelGraphics.x = p3.x;
    pointLabelGraphics.y = p3.y;

    app.stage.addChild(pointLabelGraphics);
}

export function renderAngleBetweenLines(
    lines: Line[],
    app: PIXI.Application<HTMLCanvasElement>,
    drawingItemRef: React.MutableRefObject<
        Record<string, (PIXI.Graphics | PIXI.Text)[]>
    >,
    pointNumberRef: React.MutableRefObject<number>,
    graphics?: PIXI.Graphics,
    angleTextGraphics?: PIXI.Text,
) {
    const labels = "ABCDEFGHIJKLMNOPQRSTUPWXYZ".split("");
    for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            let line1 = lines[i];
            let line2 = lines[j];
            if (areSameLines(line1, line2)) continue;
            // renderPointName(line1, drawingItemRef, app);
            // renderPointName(line2, drawingItemRef, app);
            const commonPoint = getCommonPoint(line1, line2);
            console.log("cp", commonPoint)
            if (!commonPoint) {
                continue;
            }
            const line1End = isSamePoint(commonPoint, line1.start)
                ? line1.end
                : line1.start;
            const line2End = isSamePoint(commonPoint, line2.start)
                ? line2.end
                : line2.start;
            line1 = {
                start: commonPoint,
                end: line1End,
            };
            line2 = {
                start: commonPoint,
                end: line2End,
            }

            const angleDegrees = getAngleBetweenLines(line1, line2);
            if (angleDegrees === -1) {
                continue;
            }
            // console.log(`line${i + 1}-line${j + 1}-${angleDegrees}`);
            const key = `${JSON.stringify(commonPoint)}-${JSON.stringify(
                line1.end,
            )}-${JSON.stringify(line2.end)}`;
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

            const pointLabelKey = JSON.stringify(commonPoint);
            let pointLabelGraphics = new PIXI.Text("", textGraphicsOptions);
            if (drawingItemRef.current[pointLabelKey]) {
                pointLabelGraphics = drawingItemRef.current[
                    pointLabelKey
                ][0] as PIXI.Text;
                app.stage.removeChild(pointLabelGraphics);
            } else {
                // console.log(pointLabelKey, labelIdx, labels[labelIdx]);
                drawingItemRef.current[pointLabelKey] = [pointLabelGraphics];
                pointLabelGraphics.text = labels[pointNumberRef.current];
                pointNumberRef.current = pointNumberRef.current + 1;
            }
            const p1 = findPointAtDistance(line1, -20);
            const p2 = findPointAtDistance(line2, -20);
            const p3 = findParallelogramFourthPoint([commonPoint, p1, p2], 0)!;
            pointLabelGraphics.x = p3.x;
            pointLabelGraphics.y = p3.y;

            app.stage.addChild(pointLabelGraphics);
            // renderPointName(line1, drawingItemRef, app);
            app.stage.addChild(g);
            app.stage.addChild(atg);
            if (!drawingItemRef.current[key]) {
                drawingItemRef.current[key] = [];
            }
            drawingItemRef.current[key].push(g);
            drawingItemRef.current[key].push(atg);
        }
    }
}

export function renderNewLine(
    start: Point,
    end: Point,
    setDrawingItems: (value: React.SetStateAction<DrawingItem[]>) => void,
) {
    if (!isSamePoint(start, end)) {
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
}
