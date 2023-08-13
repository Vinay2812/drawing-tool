import { Point } from "../../components/DrawingArea";
import { isSamePoint } from "../line";

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
    console.log("result", result);
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
