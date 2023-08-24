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
    getDistance,
    getLabelPosition,
    isSamePoint,
    roundupNumber,
    slope,
    getCommonPointsMap,
    getLineFromLines,
    getPointsSortedInClockwise,
} from "../utils/calculations";
import { isMobile } from "../utils/config";
import { SmoothGraphics } from "@pixi/graphics-smooth";
import {
    getAngleKey,
    getLabelKey,
    getLineKey,
    getPointFromPointKey,
} from "../utils/keys";
import { Viewport } from "pixi-viewport";
import { CanvasConfig } from "../../components/DrawingArea";

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
    config: CanvasConfig,
) {
    const { start, end } = line;
    graphics.lineStyle(config.lineWidth, color, 1);
    graphics.moveTo(start.x, start.y);
    graphics.lineTo(end.x, end.y);
    renderPoint(graphics, start, 4, color);
    renderPoint(graphics, end, 4, color);
}

export function renderDistanceOnLine(
    textGraphics: PIXI.Text,
    line: Line,
    config: CanvasConfig,
) {
    const { start, end } = line;
    const distance = getDistance(start, end);
    textGraphics.text = `${roundupNumber(distance / config.gridSize)} ${config.unit}`;
    // const textWidth =
    let p1 = start;
    let p2 = end;
    let gap = config.gridSize / (isMobile() ? 3.5 : 2.75) + config.lineWidth * 1.2;

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

export function renderLineGraphics(
    line: Line,
    viewport: Viewport,
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >,
    config: CanvasConfig,
) {
    const { start, end, shapeId } = line;
    const lineGraphics = new SmoothGraphics();
    const textGraphics = new PIXI.Text("", config.textGraphicsOptions);
    textGraphics.resolution = 1 + viewport.scale.x;

    const key = getLineKey(line);
    if (!graphicsStoreRef.current[key]) {
        graphicsStoreRef.current[key] = [];
    } else {
        graphicsStoreRef.current[key].forEach((item) => {
            viewport.removeChild(item);
        });
        graphicsStoreRef.current[key] = [];
    }
    graphicsStoreRef.current[key].push(lineGraphics);
    graphicsStoreRef.current[key].push(textGraphics);
    renderLine(lineGraphics, { start, end, shapeId }, "red", config);
    renderDistanceOnLine(textGraphics, { start, end, shapeId }, config);
    viewport.addChild(lineGraphics);
    viewport.addChild(textGraphics);
}

function renderAngleWithLabelGraphics(
    l1: Line,
    l2: Line,
    commonPoint: Point,
    angleDegrees: number,
    graphics: SmoothGraphics,
    angleTextGraphics: PIXI.Text,
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >,
    pointNumberRef: React.MutableRefObject<number>,
    viewport: Viewport,
    config: CanvasConfig,
) {
    const labels = "ABCDEFGHIJKLMNOPQRSTUPWXYZ".split("");
    const line1: Line = {
        start: commonPoint,
        end: isSamePoint(l1.start, commonPoint) ? l1.end : l1.start,
        shapeId: l1.shapeId,
    };
    const line2: Line = {
        start: commonPoint,
        end: isSamePoint(l2.start, commonPoint) ? l2.end : l2.start,
        shapeId: l2.shapeId,
    };

    const line1Length = getDistance(line1.start, line1.end);
    const line2Length = getDistance(line2.start, line2.end);

    const minLength = Math.min(line1Length, line2Length);
    const gap = Math.min(minLength, config.gridSize) * (isMobile() ? 0.4 : 0.6);

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

    const labelPoint = findParallelogramFourthPoint(
        [commonPoint, arcStartPoint, arcEndPoint],
        0,
        -1,
    )!;

    const labelKey = getLabelKey(commonPoint);
    if (!graphicsStoreRef.current[labelKey]) {
        graphicsStoreRef.current[labelKey] = [
            new PIXI.Text(
                `${labels[pointNumberRef.current]}`,
                config.textGraphicsOptions,
            ),
        ];
        pointNumberRef.current = (pointNumberRef.current + 1) % 26;
        viewport.addChild(graphicsStoreRef.current[labelKey][0] as PIXI.Text);
    }
    const labelGraphics = graphicsStoreRef.current[labelKey][0] as PIXI.Text;
    labelGraphics.x = labelPoint.x;
    labelGraphics.y = labelPoint.y;
    labelGraphics.resolution = 1 + viewport.scale.x;
}

export function renderAngleBetweenLines(
    lines: Line[],
    viewport: Viewport,
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >,
    pointNumberRef: React.MutableRefObject<number>,
    config: CanvasConfig,
) {
    const commonPointMap = getCommonPointsMap(lines);
    const angleGraphicsKeys = Object.keys(graphicsStoreRef.current).filter(
        (key) => key.startsWith("angle"),
    );
    angleGraphicsKeys.forEach((key) => {
        graphicsStoreRef.current[key].forEach((g) => viewport.removeChild(g));
    });
    for (const [key, endPoints] of commonPointMap.entries()) {
        if (endPoints.length < 2) {
            continue;
        }
        const commonPoint = getPointFromPointKey(key);
        // const commonPoint = key;
        const sortedPoints = getPointsSortedInClockwise(endPoints, commonPoint);
        const n = sortedPoints.length;
        let totalAngleSum = 0;
        // let largestAngleKey = "";
        // let largestAngle = 120;
        for (let i = 1; i <= n; i++) {
            if (i === n && totalAngleSum <= 180) continue;
            const endPoint1 = sortedPoints[(i - 1 + n) % n];
            const endPoint2 = sortedPoints[i % n];

            let line1 = {
                start: commonPoint,
                end: endPoint1,
                shapeId: -1,
            };
            let line2 = {
                start: commonPoint,
                end: endPoint2,
                shapeId: -1,
            };
            line1 = getLineFromLines(line1, lines)!;
            line2 = getLineFromLines(line2, lines)!;
            if (!line1 || !line2) continue;
            line1 = {
                shapeId: line1.shapeId,
                start: commonPoint,
                end: endPoint1,
            } as Line;
            line2 = {
                shapeId: line2.shapeId,
                start: commonPoint,
                end: endPoint2,
            } as Line;

            const angleDegrees = getAngleBetweenLines(line1, line2);
            if (angleDegrees === -1) {
                continue;
            }

            totalAngleSum += angleDegrees;
            const g = new SmoothGraphics();
            const atg = new PIXI.Text("", config.textGraphicsOptions);
            atg.resolution = 1 + viewport.scale.x;

            renderAngleWithLabelGraphics(
                line1,
                line2,
                commonPoint,
                angleDegrees,
                g,
                atg,
                graphicsStoreRef,
                pointNumberRef,
                viewport,
                config,
            );

            const key = getAngleKey(line1, line2);
            viewport.addChild(g);
            viewport.addChild(atg);
            graphicsStoreRef.current[key] = [g, atg];
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
