import * as PIXI from "pixi.js";
import { Pencil } from "../../components/DrawingArea";
import { SmoothGraphics } from "@pixi/graphics-smooth";
import { getPencilKey } from "../utils/keys";
import { LINE_WIDTH, isMobile } from "../utils/config";
import { renderPoint } from "../line";
import { Viewport } from "pixi-viewport";

export function renderPencilGraphics(
    pencil: Pencil,
    viewport: Viewport,
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >,
) {
    const { points } = pencil;
    if (points.length < 1) return;
    const g = new SmoothGraphics();
    g.blendMode = PIXI.BLEND_MODES.NORMAL;
    const color = "red";
    g.lineStyle(LINE_WIDTH, color, 1);
    g.moveTo(points[0].x, points[0].y);
    g.lineTo(points[1].x, points[1].y);
    if (points.length < (isMobile() ? 8 : 4)) {
        renderPoint(g, points[0], 2, color);
    } else {
        const n = points.length;
        const gap = isMobile() ? 1 : 3;
        for (let i = 1; i < n; i += gap) {
            const p1 = points[i - 1];
            const p2 = points[i];
            g.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
        }
    }
    const key = getPencilKey(pencil);
    graphicsStoreRef.current[key]?.forEach((g) => viewport.removeChild(g));
    graphicsStoreRef.current[key] = [g];
    viewport.addChild(g);
}
