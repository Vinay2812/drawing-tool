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
    if (isSamePoint(line1.start, line2.start)) return line1.start;
    if (isSamePoint(line1.start, line2.end)) return line1.start;
    if (isSamePoint(line1.end, line2.end)) return line1.end;
    if (isSamePoint(line1.end, line2.start)) return line1.end;
    return null;
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

export function findParallelogramFourthPoint(
    triangleVertices: Point[],
    vertexIndex: number,
    distanceFactor: number,
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
    const fourthPointDistance =
        distanceFactor * Math.sqrt(vector1.x ** 2 + vector1.y ** 2);

    // Normalize the angle bisector vector
    const normalizedAngleBisector = {
        x: angleBisector.x / angleBisectorMagnitude,
        y: angleBisector.y / angleBisectorMagnitude,
    };

    // Calculate the position of the fourth point
    const fourthPoint = {
        x: vertex.x + fourthPointDistance * normalizedAngleBisector.x,
        y: vertex.y + fourthPointDistance * normalizedAngleBisector.y,
    };

    return fourthPoint;
}

function determineOrientationByPoints(point1: Point, point2: Point) {
    const deltaY = point2.y - point1.y;
    const deltaX = point2.x - point1.x;

    const deltaThreshold = 2;

    if (Math.abs(deltaX) < deltaThreshold || deltaY > 0) {
        return "right";
    } else {
        return "left";
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
    const moveDistance = 15;
    let x = midpoint.x;
    let y = midpoint.y;

    // Calculate perpendicular distances
    const perpendicularDistanceLeft = -gap;
    const perpendicularDistanceRight = gap;

    // Move closer to the start point by moveDistance units
    const moveX = moveDistance * Math.cos(angle + Math.PI);
    const moveY = moveDistance * Math.sin(angle + Math.PI);

    if (orientation === "left") {
        x += perpendicularDistanceLeft * Math.cos(angle + Math.PI / 2) + moveX;
        y += perpendicularDistanceLeft * Math.sin(angle + Math.PI / 2) + moveY;
    } else {
        x += perpendicularDistanceRight * Math.cos(angle - Math.PI / 2) + moveX;
        y += perpendicularDistanceRight * Math.sin(angle - Math.PI / 2) + moveY;
    }

    return { x, y };
}

export function getPointerPosition(event: MouseEvent, container?: HTMLElement) {
    const pos = { x: 0, y: 0 };
    if (container) {
        // Get the position and size of the component on the page.
        const holderOffset = container.getBoundingClientRect();
        const containerScrollX = container.scrollLeft;
        const containerScrollY = container.scrollTop;

        // Calculate the adjusted pointer position
        pos.x = event.clientX - holderOffset.x + containerScrollX;
        pos.y = event.clientY - holderOffset.y + containerScrollY;
    }
    return pos;
}

export function getPointsFromLines(lines: Line[]) {
    if (!lines) return [];
    return lines.flatMap((line) => [line.start, line.end]);
}

export function getPointNamePosition(
    point1: Point,
    point2: Point,
    gap: number,
) {
    const slope = (point2.y - point1.y) / (point2.x - point1.x);

    const deltaX = gap / Math.sqrt(1 + slope * slope);
    const deltaY = slope * deltaX;

    const directionX = point2.x > point1.x ? -1 : 1;
    const directionY = point2.y > point1.y ? -1 : 1;

    const newX = point2.x + directionX * deltaX;
    const newY = point2.y + directionY * deltaY;

    return { x: newX, y: newY };
}

export function getPointsAppearingOnce(points: Point[]): Point[] {
    const pointCountMap: Record<string, number> = {};
    // Count the occurrences of each point
    for (const point of points) {
        const key = `${point.x}-${point.y}`;
        if (pointCountMap[key]) {
            pointCountMap[key]++;
        } else {
            pointCountMap[key] = 1;
        }
    }

    const result: Point[] = [];

    // Collect points with count 1
    for (const key in pointCountMap) {
        if (pointCountMap[key] === 1) {
            const [x, y] = key.split("-").map(Number);
            result.push({ x, y });
        }
    }
    console.log("solo points", result);
    return result;
}

export function isPointAppearingOnce(point: Point, allPoints: Point[]) {
    const points = getPointsAppearingOnce(allPoints);
    for (const p of points) {
        if (isSamePoint(p, point)) {
            return true;
        }
    }
    return false;
}

export function areSameLines(line1: Line, line2: Line) {
    return (
        (isSamePoint(line1.start, line2.start) &&
            isSamePoint(line1.end, line2.end)) ||
        (isSamePoint(line1.start, line2.end) &&
            isSamePoint(line1.end, line2.start))
    );
}