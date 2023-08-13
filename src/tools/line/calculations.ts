import type { Point, Line } from "../../components/DrawingArea";

export function isSamePoint(start: Point, end: Point) {
    return start.x === end.x && start.y === end.y;
}

export function getDistance(p1: Point, p2: Point): number {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

export function getMidpoint(p1: Point, p2: Point): Point {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
    };
}

export function hasCommonPoint(line1: Line, line2: Line) {
    return (
        isSamePoint(line1.start, line2.start) ||
        isSamePoint(line1.start, line2.end) ||
        isSamePoint(line1.end, line2.start) ||
        isSamePoint(line1.end, line2.end)
    );
}

export function getCommonPoint(line1: Line, line2: Line) {
    const x1 = line1.start.x;
    const y1 = line1.start.y;
    const x2 = line1.end.x;
    const y2 = line1.end.y;

    const x3 = line2.start.x;
    const y3 = line2.start.y;
    const x4 = line2.end.x;
    const y4 = line2.end.y;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (denominator === 0) {
        // Lines are parallel or coincident
        return null;
    }

    const px =
        ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
        denominator;
    const py =
        ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
        denominator;

    return { x: px, y: py };
}

export function getAngleBetweenLines(line1: Line, line2: Line) {
    if (!hasCommonPoint(line1, line2)) {
        return -1;
    }
    const directionVector1 = [
        line1.end.x - line1.start.x,
        line1.end.y - line1.start.y,
    ];
    const directionVector2 = [
        line2.end.x - line2.start.x,
        line2.end.y - line2.start.y,
    ];

    // Calculate dot product
    const dotProduct =
        directionVector1[0] * directionVector2[0] +
        directionVector1[1] * directionVector2[1];

    // Calculate magnitudes
    const magnitude1 = Math.sqrt(
        directionVector1[0] ** 2 + directionVector1[1] ** 2,
    );
    const magnitude2 = Math.sqrt(
        directionVector2[0] ** 2 + directionVector2[1] ** 2,
    );

    // Calculate angle in radians
    const angleRadians = Math.acos(dotProduct / (magnitude1 * magnitude2));
    const angleDegrees = (angleRadians * 180) / Math.PI;

    return angleDegrees;
}

export function findPointAtDistance(line: Line, distance: number) {
    const { start, end } = line;
    const length = getDistance(start, end);
    if (length === 0) {
        return { x: start.x, y: start.y }; // Handle case when start and end are the same
    }
    const t = distance / length;
    const point = {
        x: start.x + t * (end.x - start.x),
        y: start.y + t * (end.y - start.y),
    };
    return point;
}

export function roundupNumber(num: number, precision = 1) {
    const multiplyBy = Math.pow(10, precision);
    return Math.round(num * multiplyBy) / multiplyBy;
}

export function isTriangle(points: Point[]) {
    if (points.length !== 6) {
        return [];
    }

    let collidingPoints = 0;

    for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < points.length; j++) {
            if (i === j) continue;
            const p1 = points[i];
            const p2 = points[j];

            const d = getDistance(p1, p2);
            if (d === 0) collidingPoints++;
            if (collidingPoints === 3) return true;
        }
    }
    return false;
}

export function getClosestPoint(
    newPoint: Point,
    points: Point[],
    threshold = 25,
) {
    let closestIdx = -1;

    for (let i = 0; i < points.length; i++) {
        const d = getDistance(newPoint, points[i]);

        if (
            d < threshold &&
            (closestIdx === -1 || d < getDistance(newPoint, points[closestIdx]))
        ) {
            closestIdx = i;
        }
    }

    if (closestIdx === -1) return newPoint;
    return points[closestIdx];
}

export function slope(point1: Point, point2: Point) {
    return (point2.y - point1.y) / (point2.x - point1.x);
}

export function findPointParallelToLine(line: Line, distance: number) {
    const { start: lineStart, end: lineEnd } = line;
    const midpoint = getMidpoint(lineStart, lineEnd);

    // Calculate the slope of the line
    const slope = (lineEnd.y - lineStart.y) / (lineEnd.x - lineStart.x);

    // Calculate the perpendicular vector
    const perpendicularVector = { x: -slope, y: 1 };

    // Calculate the length of the perpendicular vector
    const perpendicularVectorLength = Math.sqrt(
        perpendicularVector.x ** 2 + perpendicularVector.y ** 2,
    );

    // Normalize the perpendicular vector
    const normalizedPerpendicularVector = {
        x: perpendicularVector.x / perpendicularVectorLength,
        y: perpendicularVector.y / perpendicularVectorLength,
    };

    // Calculate the new point's coordinates
    const newX = midpoint.x + distance * normalizedPerpendicularVector.x;
    const newY = midpoint.y + distance * normalizedPerpendicularVector.y;

    return { x: newX, y: newY };
}

export function findParallelogramFourthPoint(
    triangleVertices: Point[],
    vertexIndex: number,
) {
    if (triangleVertices.length !== 3 || vertexIndex < 0 || vertexIndex > 2) {
        return null; // Invalid input
    }

    // Choose the vertex of the triangle
    const vertex = triangleVertices[vertexIndex];

    // Find the two adjacent vertices
    const adjacentVertices = [
        triangleVertices[(vertexIndex + 1) % 3],
        triangleVertices[(vertexIndex + 2) % 3],
    ];

    // Calculate the vectors of the sides adjacent to the chosen vertex
    const vector1 = {
        x: adjacentVertices[0].x - vertex.x,
        y: adjacentVertices[0].y - vertex.y,
    };
    const vector2 = {
        x: adjacentVertices[1].x - vertex.x,
        y: adjacentVertices[1].y - vertex.y,
    };

    // Calculate the angle bisector
    const angleBisector = {
        x: vector1.x + vector2.x,
        y: vector1.y + vector2.y,
    };

    // Calculate the magnitude of the angle bisector
    const angleBisectorMagnitude = Math.sqrt(
        angleBisector.x ** 2 + angleBisector.y ** 2,
    );

    // Calculate the desired distance for the fourth point from the chosen vertex
    const fourthPointDistance = 2 * Math.sqrt(vector1.x ** 2 + vector1.y ** 2);

    // Normalize the angle bisector vector
    const normalizedAngleBisector = {
        x: angleBisector.x / angleBisectorMagnitude,
        y: angleBisector.y / angleBisectorMagnitude,
    };

    // Calculate the position of the fourth point
    const fourthPoint = {
        x: vertex.x + (fourthPointDistance / 1.2) * normalizedAngleBisector.x,
        y: vertex.y + (fourthPointDistance / 1.2) * normalizedAngleBisector.y,
    };

    return fourthPoint;
}

function determineOrientationByPoints(point1: Point, point2: Point) {
    const deltaY = point2.y - point1.y;
    const deltaX = point2.x - point1.x;

    const deltaThreshold = 2;

    if (Math.abs(deltaX) < deltaThreshold) {
        return "vertical"; // Vertical or Horizontal
    } else if (Math.abs(deltaY) < deltaThreshold) {
        return "horizontal"; // Horizontal or Vertical
    } else if (deltaY < 0) {
        return "right"; // Right incline
    } else if (deltaY > 0) {
        return "left"; // Left incline
    } else {
        return "horizontal"; // Horizontal (fallback)
    }
}

export function getLabelPosition(
    point1: Point,
    point2: Point,
    gap: number = 25,
) {
    const midpoint = getMidpoint(point1, point2);
    const angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);
    const orientation = determineOrientationByPoints(point1, point2);

    let x = midpoint.x;
    let y = midpoint.y;

    // Calculate perpendicular distances
    const perpendicularDistanceLeft = -gap;
    const perpendicularDistanceRight = gap;
    // console.log(orientation);

    if (orientation === "horizontal") {
        y += gap;
    } else if (orientation === "left") {
        x += perpendicularDistanceLeft * Math.cos(angle + Math.PI / 2);
        y += perpendicularDistanceLeft * Math.sin(angle + Math.PI / 2);
    } else if (orientation === "right") {
        x += perpendicularDistanceRight * Math.cos(angle - Math.PI / 2);
        y += perpendicularDistanceRight * Math.sin(angle - Math.PI / 2);
    } else {
        x += gap;
    }

    return { x, y };
}

export function getMousePos(event: MouseEvent, container?: HTMLElement) {
    const pos = { x: 0, y: 0 };
    if (container) {
        // Get the position and size of the component on the page.
        const holderOffset = container.getBoundingClientRect();
        pos.x = event.pageX - holderOffset.x;
        pos.y = event.pageY - holderOffset.y;
    }
    return pos;
}

export function getPointsFromLines(lines: Line[]) {
    return lines.flatMap((line) => [line.start, line.end]);
}
