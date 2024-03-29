import { Circle, Line, Pencil, Point } from "../../components/drawing-tool";

export function getAngleKey(line1: Line, line2: Line) {
    return `angle-${line1.shapeId}-${line2.shapeId}`;
}

export function getLineKey(line: Line) {
    return `line-${line.shapeId}`;
}

export function getPencilKey(pencil: Pencil) {
    return `pencil-${pencil.shapeId}`;
}

export function getPointKey(point: Point) {
    return `point/${point.x}/${point.y}`;
}

export function getPointFromPointKey(key: string) {
    const splits = key.split("/").filter((s) => s.length > 0);
    return {
        x: parseFloat(splits[1]),
        y: parseFloat(splits[2]),
    };
}

export function getLabelKey(point: Point) {
    return `label-${point.x}-${point.y}`;
}

export function getCircleKey(circle: Circle) {
    return `circle-${circle.shapeId}`;
}
