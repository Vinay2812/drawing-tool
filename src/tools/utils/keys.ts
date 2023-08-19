import { Line, Pencil } from "../../components/DrawingArea";

export function getAngleKey(line1:Line, line2:Line) {
    return `angle-${line1.shapeId}-${line2.shapeId}`
}

export function getLineKey (line: Line) {
    return `line-${line.shapeId}`
}

export function getPencilKey (pencil: Pencil) {
    return `pencil-${pencil.shapeId}`
}