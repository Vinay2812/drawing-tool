import { SmoothGraphics } from "@pixi/graphics-smooth";
import { getDistance } from "../utils/calculations";
import { Circle, Point } from "../../components/DrawingArea";
import { LINE_WIDTH, textGraphicsOptions } from "../utils/config";
import * as PIXI from "pixi.js";
import { renderDistanceOnLine, renderLine } from "../line";
import { Viewport } from "pixi-viewport";

export function renderCircle(
    start: Point,
    end: Point,
    circleGraphics: SmoothGraphics,
) {
    const radius = getDistance(start, end);

    circleGraphics.moveTo(start.x, start.y);
    circleGraphics.lineStyle({
        width: LINE_WIDTH,
        color: "orange",
    });
    circleGraphics.drawCircle(start.x, start.y, radius);
}

export function renderCircleWithMeasurements(
    circle: Circle,
    viewport: Viewport,
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >,
    circleGraphics?: SmoothGraphics,
    textGraphics?: PIXI.Text,
) {
    if (!circleGraphics) circleGraphics = new SmoothGraphics();
    if (!textGraphics) textGraphics = new PIXI.Text("", textGraphicsOptions);
    textGraphics.resolution = 4;
    const { start, end } = circle;
    const key = `circle-${JSON.stringify(start)}-${JSON.stringify(end)}`;
    if (!graphicsStoreRef.current[key]) {
        graphicsStoreRef.current[key] = [];
    } else {
        graphicsStoreRef.current[key].forEach((item) => {
            viewport.removeChild(item);
        });
        graphicsStoreRef.current[key] = [];
    }
    graphicsStoreRef.current[key].push(circleGraphics);
    graphicsStoreRef.current[key].push(textGraphics);
    renderCircle(start, end, circleGraphics);
    renderLine(circleGraphics, circle, "orange");
    renderDistanceOnLine(textGraphics, circle);
    viewport.addChild(circleGraphics);
    viewport.addChild(textGraphics);
}
