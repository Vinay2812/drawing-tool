import { Line } from "../../components/DrawingArea";

export function getAngleKey(line1:Line, line2:Line) {
    return `angle-${line1.shapeId}-${line2.shapeId}`
}

export function getLineKey (line: Line) {
    return `line-${line.shapeId}`
}