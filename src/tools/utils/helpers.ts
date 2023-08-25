import { SmoothGraphics } from "@pixi/graphics-smooth";
import { Viewport } from "pixi-viewport";
import * as PIXI from "pixi.js";

export function resetGraphics(
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >,
    pointNumberRef: React.MutableRefObject<number>,
    // appRef: React.MutableRefObject<PIXI.Application<HTMLCanvasElement> | null>,
    viewportRef: React.MutableRefObject<Viewport | null>,
) {
    if (!viewportRef.current) return;
    Object.keys(graphicsStoreRef.current).forEach((key) => {
        graphicsStoreRef.current[key].forEach((g) => {
            viewportRef.current!.removeChild(g);
        });
    });
    pointNumberRef.current = 0;
}

export async function delay(ms = 100) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), ms);
    });
}
