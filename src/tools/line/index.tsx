import * as PIXI from "pixi.js";
import { useEffect, useRef, useState } from "react";

type Props = {
    // app: PIXI.Application<HTMLCanvasElement>;
    drawingItems: any[];
    setDrawingItems: React.Dispatch<React.SetStateAction<any[]>>;
};

export default function Line({
    drawingItems: drawings,
    setDrawingItems: setDrawings,
}: Props) {
    const app = new PIXI.Application<HTMLCanvasElement>({
        resolution: 1,
        antialias: false,
        width: 500,
        height: 500,
        backgroundColor: "black"
    });
    const containerRef = new PIXI.Container();
    app.stage.addChild(containerRef);
    const container = document.querySelector("body");
    if (!container) return "Loading"
    container.appendChild(app.view);

    let sprite = new PIXI.Graphics();
    let initPointer: any = null;

    let isMouseButtonDown = false;

    const getMousePos = (event: React.MouseEvent) => {
        const pos = { x: 0, y: 0 };
        if (container) {
            // Get the position and size of the component on the page.
            const holderOffset = container.getBoundingClientRect();
            pos.x = event.pageX - holderOffset.x;
            pos.y = event.pageY - holderOffset.y;
        }
        return pos;
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isMouseButtonDown) {
            return;
        }

        // clearSpriteRef(containerRef)
        if (initPointer == null) return;

        sprite.clear();
        sprite.lineStyle(2, 0xff0000, 1);
        sprite.moveTo(initPointer.x, initPointer.y);

        const mousePosRef = getMousePos(e);
        sprite.lineTo(mousePosRef.x, mousePosRef.y);
    };
    const onMouseDown = (e: React.MouseEvent) => {
        const mousePosRef = getMousePos(e);
        initPointer = mousePosRef;

        sprite = new PIXI.Graphics();
        sprite.lineStyle(2, 0xff0000, 1);
        sprite.moveTo(initPointer.x, initPointer.y);
        sprite.lineTo(mousePosRef.x, mousePosRef.y);

        containerRef.addChild(sprite);

        isMouseButtonDown = true;
    };
    const onMouseUp = (e: React.MouseEvent) => {
        isMouseButtonDown = false;
    };
    container.onmousedown((e) => {
        const mousePosRef = getMousePos(e);
        initPointer = mousePosRef;

        sprite = new PIXI.Graphics();
        sprite.lineStyle(2, 0xff0000, 1);
        sprite.moveTo(initPointer.x, initPointer.y);
        sprite.lineTo(mousePosRef.x, mousePosRef.y);

        containerRef.addChild(sprite);

        isMouseButtonDown = true;
    });

    container.addEventListener("mousedown", onMouseDown);

    container.addEventListener("mouseup", onMouseUp);
    return <div id ="stage-container">
        <canvas />
    </div>;
}
