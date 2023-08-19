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
    areSameLines,
} from "../utils/calculations";
import {
    GRID_UNIT,
    LINE_WIDTH,
    isMobile,
    textGraphicsOptions,
} from "../utils/config";
import { SmoothGraphics } from "@pixi/graphics-smooth";

export function removeGraphicsFromStore(
    key: string,
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >,
    app: PIXI.Application<HTMLCanvasElement>,
) {
    graphicsStoreRef.current[key]?.forEach((g) => {
        if (g instanceof PIXI.Text) {
            g.text = "";
        } else {
            app.stage.removeChild(g);
        }
    });
}

export function renderPoint(
    graphics: SmoothGraphics,
    point: Point,
    radius: number,
    color: string,
) {
    graphics.beginFill(color);
    graphics.drawCircle(point.x, point.y, radius);
    graphics.endFill();
}

export function renderLine(
    graphics: SmoothGraphics,
    line: Line,
    color: string,
) {
    const { start, end } = line;
    graphics.lineStyle(LINE_WIDTH, color, 1);

    graphics.moveTo(start.x, start.y);
    graphics.lineTo(end.x, end.y);
    renderPoint(graphics, start, 4, color);
    renderPoint(graphics, end, 4, color);
}

export function renderDistanceOnLine(textGraphics: PIXI.Text, line: Line) {
    const { start, end } = line;
    const distance = getDistance(start, end);
    textGraphics.text = `${roundupNumber(distance / GRID_UNIT)} cm`;
    // const textWidth =
    let p1 = start;
    let p2 = end;
    let gap = GRID_UNIT / (isMobile() ? 3.5 : 2) + LINE_WIDTH * 1.2;

    if ((p2.x < p1.x && p2.y < p1.y) || (p2.x < p1.x && p2.y > p1.y)) {
        p1 = end;
        p2 = start;
        gap /= 1.2;
    }
    const s = slope(p1, p2);
    const angle = Math.atan(s);
    // const gap = 10;
    const p = getLabelPosition(p1, p2, gap);
    textGraphics.rotation = angle;
    // renderPoint(graphics, p, 3, "blue");
    textGraphics.x = p.x;
    textGraphics.y = p.y;
}

export function renderLineWithMeasurements(
    line: Line,
    app: PIXI.Application<HTMLCanvasElement>,
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >,
    lineGraphics?: SmoothGraphics,
    textGraphics?: PIXI.Text,
) {
    const { start, end, shapeId } = line;
    if (!lineGraphics) lineGraphics = new SmoothGraphics();
    if (!textGraphics) textGraphics = new PIXI.Text("", textGraphicsOptions);
    const key = `line-${JSON.stringify(start)}-${JSON.stringify(end)}`;
    if (!graphicsStoreRef.current[key]) {
        graphicsStoreRef.current[key] = [];
    } else {
        graphicsStoreRef.current[key].forEach((item) => {
            app.stage.removeChild(item);
        });
        graphicsStoreRef.current[key] = [];
    }
    graphicsStoreRef.current[key].push(lineGraphics);
    graphicsStoreRef.current[key].push(textGraphics);
    renderLine(lineGraphics, { start, end, shapeId }, "red");
    // const textGraphics = new PIXI.Text("", textGraphicsOptions);
    renderDistanceOnLine(textGraphics, { start, end, shapeId });
    app.stage.addChild(lineGraphics);
    app.stage.addChild(textGraphics);
}

function renderPointLabel(
    line1: Line,
    line2: Line,
    commonPoint: Point,
    app: PIXI.Application<HTMLCanvasElement>,
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >,
    pointNumberRef: React.MutableRefObject<number>,
) {
    const labels = "ABCDEFGHIJKLMNOPQRSTUPWXYZ".split("");
    const pointLabelKey = JSON.stringify(commonPoint);
    let pointLabelGraphics = new PIXI.Text("", textGraphicsOptions);
    if (graphicsStoreRef.current[pointLabelKey]) {
        pointLabelGraphics = graphicsStoreRef.current[
            pointLabelKey
        ][0] as PIXI.Text;
        app.stage.removeChild(pointLabelGraphics);
    } else {
        // console.log(pointLabelKey, labelIdx, labels[labelIdx]);
        graphicsStoreRef.current[pointLabelKey] = [pointLabelGraphics];
        pointLabelGraphics.text = labels[pointNumberRef.current];
        pointNumberRef.current = pointNumberRef.current + 1;
    }
    const p1 = findPointAtDistance(line1, -20);
    const p2 = findPointAtDistance(line2, -20);
    const p3 = findParallelogramFourthPoint([commonPoint, p1, p2], 0, 1.2)!;
    pointLabelGraphics.x = p3.x - 10;
    pointLabelGraphics.y = p3.y - 10;
    app.stage.addChild(pointLabelGraphics);
}

function renderAngleGraphics(
    line1: Line,
    line2: Line,
    commonPoint: Point,
    angleDegrees: number,
    graphics: SmoothGraphics,
    angleTextGraphics: PIXI.Text,
) {
    const line1Length = getDistance(line1.start, line1.end);
    const line2Length = getDistance(line2.start, line2.end);

    const minLength = Math.min(line1Length, line2Length);

    const gap = Math.min(minLength, GRID_UNIT) * (isMobile() ? 0.4 : 0.6);
    const controlPointFactor = 1.5;

    const arcStartPoint = findPointAtDistance(line1, gap);
    const arcEndPoint = findPointAtDistance(line2, gap);

    const controlPoint = findParallelogramFourthPoint(
        [commonPoint, arcStartPoint, arcEndPoint],
        0,
        controlPointFactor,
    )!;
    if (!controlPoint) return;

    // Create a Graphics object to draw the arc
    graphics.lineStyle(2, "black", 1, 0.5);

    // Draw the arc
    graphics.moveTo(arcStartPoint.x, arcStartPoint.y);
    graphics.quadraticCurveTo(
        controlPoint.x,
        controlPoint.y,
        arcEndPoint.x,
        arcEndPoint.y,
    );
    const angleFourthPoint = findParallelogramFourthPoint(
        [commonPoint, arcStartPoint, arcEndPoint],
        0,
        controlPointFactor + 0.35,
    )!;
    angleTextGraphics.x = angleFourthPoint.x - 10;
    angleTextGraphics.y = angleFourthPoint.y - 10;
    angleTextGraphics.text = `${roundupNumber(angleDegrees, 0)}°`;
}

export function renderAngleBetweenLines(
    lines: Line[],
    app: PIXI.Application<HTMLCanvasElement>,
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >,
    pointNumberRef: React.MutableRefObject<number>,
) {
    for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            let line1 = lines[i];
            let line2 = lines[j];
            if (areSameLines(line1, line2)) {
                continue;
            }
            const commonPoint = getCommonPoint(line1, line2);
            if (!commonPoint) {
                continue;
            }

            line1 = {
                shapeId: line1.shapeId,
                start: commonPoint,
                end: isSamePoint(commonPoint, line1.start)
                    ? line1.end
                    : line1.start,
            };
            line2 = {
                shapeId: line2.shapeId,
                start: commonPoint,
                end: isSamePoint(commonPoint, line2.start)
                    ? line2.end
                    : line2.start,
            };

            const angleDegrees = getAngleBetweenLines(line1, line2);
            if (angleDegrees === -1) {
                continue;
            }
            const g = new SmoothGraphics();
            const atg = new PIXI.Text("", textGraphicsOptions);

            renderAngleGraphics(
                line1,
                line2,
                commonPoint,
                angleDegrees,
                g,
                atg,
            );

            renderPointLabel(
                line1,
                line2,
                commonPoint,
                app,
                graphicsStoreRef,
                pointNumberRef,
            );

            // const key = `angle-${JSON.stringify(commonPoint)}-${JSON.stringify(
            //     line1.end,
            // )}-${JSON.stringify(line2.end)}`;
            const key = `angle-${JSON.stringify(commonPoint)}`;

            // if (!graphicsStoreRef.current[key]) {
            //     graphicsStoreRef.current[key] = [];
            // }
            app.stage.addChild(g);
            app.stage.addChild(atg);

            graphicsStoreRef.current[key]?.forEach((g) =>
                app.stage.removeChild(g),
            );
            graphicsStoreRef.current[key] = [];

            // app.stage.addChild(g);
            // app.stage.addChild(atg);
            graphicsStoreRef.current[key].push(g);
            graphicsStoreRef.current[key].push(atg);
        }
    }
}

export function renderNewLine(
    line: Line,
    setDrawingItems: (value: React.SetStateAction<DrawingItem[]>) => void,
) {
    const { start, end, shapeId } = line;
    if (!isSamePoint(start, end)) {
        setDrawingItems((prev) => {
            return [
                ...prev,
                {
                    id: prev.length + 1,
                    type: "line",
                    data: {
                        shapeId,
                        start,
                        end,
                    },
                },
            ];
        });
    }
}
