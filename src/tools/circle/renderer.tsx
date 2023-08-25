import { SmoothGraphics } from "@pixi/graphics-smooth";
import { getDistance } from "../utils/calculations";
import { Circle, Point } from "../../components/drawing-tool";
import * as PIXI from "pixi.js";
import { renderDistanceOnLine, renderLine } from "../line";
import { Viewport } from "pixi-viewport";
import { CanvasConfig } from "../../components/drawing-tool";
import { getCircleKey } from "../utils/keys";

export function renderCircle(
    start: Point,
    end: Point,
    circleGraphics: SmoothGraphics,
    config: CanvasConfig,
) {
    const radius = getDistance(start, end);

    circleGraphics.moveTo(start.x, start.y);
    circleGraphics.lineStyle({
        width: config.lineWidth,
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
    config: CanvasConfig,
    editable = true,
) {
    const circleGraphics = new SmoothGraphics();
    const textGraphics = new PIXI.Text("", config.textGraphicsOptions);
    textGraphics.resolution = 1 + viewport.scale.x;
    const { start, end } = circle;
    const key = getCircleKey(circle);
    if (!graphicsStoreRef.current[key]) {
        graphicsStoreRef.current[key] = [];
    } else {
        graphicsStoreRef.current[key].forEach((item) => {
            viewport.removeChild(item);
        });
    }
    if (editable) {
        graphicsStoreRef.current[key] = [circleGraphics, textGraphics];
    }
    renderCircle(start, end, circleGraphics, config);
    renderLine(circleGraphics, circle, "red", config);
    renderDistanceOnLine(textGraphics, circle, config, viewport);
    viewport.addChild(circleGraphics);
    viewport.addChild(textGraphics);
}
