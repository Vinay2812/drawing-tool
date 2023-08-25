import { Viewport } from "pixi-viewport";
import * as PIXI from "pixi.js";

export function createPixiSetup(
    appRef: React.MutableRefObject<PIXI.Application<HTMLCanvasElement> | null>,
    viewportRef: React.MutableRefObject<Viewport | null>,
    containerRef: React.MutableRefObject<HTMLElement | null>,
    canvasContainerId: string,
    canvasWidth: number,
    canvasHeight: number,
) {
    const originalWidth = 10000; // Initial width of the world
    const originalHeight = 10000; // Initial height of the world
    const container =
        document.querySelector<HTMLCanvasElement>(canvasContainerId);
    if (!container) {
        throw Error("Container not found");
    }

    const app = new PIXI.Application<HTMLCanvasElement>({
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: "transparent", // Background color
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: devicePixelRatio ?? 1,
    });
    const pixiContainer = new PIXI.Container();
    const viewport = new Viewport({
        worldWidth: originalWidth,
        worldHeight: originalHeight,
        screenWidth: canvasWidth,
        screenHeight: canvasHeight,
        events: app.renderer.events,
    })
        .pinch({
            noDrag: true,
            factor: 1,
            percent: 1,
            axis: "all",
        })
        .wheel()
        .drag({
            wheel: false,
        });
    // .decelerate();
    app.renderer.render(app.stage);
    app.ticker.start();

    pixiContainer.addChild(viewport);
    app.stage.addChild(pixiContainer);
    container.appendChild(app.view);

    containerRef.current = container;
    appRef.current = app;
    viewportRef.current = viewport;
}
