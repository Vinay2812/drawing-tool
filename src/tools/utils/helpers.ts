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

export function resetViewport(
    event: MouseEvent,
    viewport: Viewport,
    app: PIXI.Application<HTMLCanvasElement>,
) {
    const edgeThreshold = 50; // Adjust as needed
    const edgeSpeed = 100; // Adjust scrolling speed
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const viewportX = viewport.x;
    const viewportY = viewport.y;

    // Check if cursor is near the edges
    const deltaX = mouseX - viewportX;
    const deltaY = mouseY - viewportY;

    if (deltaX < edgeThreshold) {
        viewport.x -= edgeSpeed;
    } else if (deltaX > app.renderer.width - edgeThreshold) {
        viewport.x += edgeSpeed;
    }

    if (deltaY < edgeThreshold) {
        viewport.y -= edgeSpeed;
    } else if (deltaY > app.renderer.height - edgeThreshold) {
        viewport.y += edgeSpeed;
    }
}

export async function delay(ms = 100) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), ms);
    });
}
