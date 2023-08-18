import { SmoothGraphics } from "@pixi/graphics-smooth";
import * as PIXI from "pixi.js"

export function resetGraphics(
    graphicsStoreRef: React.MutableRefObject<
        Record<string, (SmoothGraphics | PIXI.Text)[]>
    >,
    pointNumberRef: React.MutableRefObject<number>,
    appRef: React.MutableRefObject<PIXI.Application<HTMLCanvasElement> | null>,
) {
    Object.keys(graphicsStoreRef.current).forEach((key) => {
        graphicsStoreRef.current[key].forEach((g) => {
            if (appRef.current) {
                appRef.current.stage.removeChild(g);
            }
        });
    });
    pointNumberRef.current = 0;
}
