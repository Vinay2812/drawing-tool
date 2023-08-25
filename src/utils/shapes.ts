import { AngleData, LineData, ShapeType } from "./../components/DrawingArea";
import { Line, Point } from "../components/DrawingArea";
import {
    getAngleBetweenLines,
    getDistance,
    getPointsFromLines,
    isSamePoint,
    roundupNumber,
} from "../tools/utils/calculations";
import { ShapeData } from "../components/DrawingArea";

let visitedArr: boolean[] = [];
let graph: number[][] = [];
let stack: number[] = [];
let cycles: number[][] = [];

function getUniquePoints(lines: Line[]) {
    const points = getPointsFromLines(lines);
    const pointsSet = new Set<Point>();
    points.forEach((point) => {
        pointsSet.add(point);
    });
    return Array.from(pointsSet);
}

function getPointIndex(points: Point[], point: Point) {
    for (let i = 0; i < points.length; i++) {
        if (isSamePoint(points[i], point)) {
            return i;
        }
    }
    return -1;
}

function createGraph(uniquePoints: Point[], lines: Line[]) {
    graph = [];
    for (const commonPoint of uniquePoints) {
        const edge: number[] = [];
        for (const line of lines) {
            const { start, end } = line;
            if (isSamePoint(start, commonPoint)) {
                edge.push(getPointIndex(uniquePoints, end));
            } else if (isSamePoint(end, commonPoint)) {
                edge.push(getPointIndex(uniquePoints, start));
            }
        }
        graph.push(edge);
    }
}

function dfs(currVertex: number, parentVertex: number, V: number) {
    if (currVertex >= V || visitedArr[currVertex]) {
        return false;
    }
    visitedArr[currVertex] = true;
    stack.push(currVertex);
    for (const endVertex of graph[currVertex]) {
        if (!visitedArr[endVertex]) {
            if (dfs(endVertex, currVertex, V)) return true;
        }
        if (endVertex !== parentVertex && visitedArr[endVertex]) {
            stack.push(endVertex);
            cycles.push(stack);
            return true;
        }
    }
    stack.pop();
    return false;
}

function getDuplicateNumber(arr: number[]) {
    const countMap = {} as Record<number, number>;

    for (const num of arr) {
        if (!countMap[num]) {
            countMap[num] = 1;
        } else {
            return num;
        }
    }
    return -1;
}

export function getShapesData(lines: Line[], gridSize: number) {
    const uniquePoints = getUniquePoints(lines);
    createGraph(uniquePoints, lines);
    stack = [];
    cycles = [];
    const V = uniquePoints.length;
    visitedArr = new Array(V);
    visitedArr.fill(false);
    for (let i = 0; i < V; i++) {
        if (!visitedArr[i]) {
            stack = [];
            dfs(i, -1, V);
        }
    }
    const result: number[][] = [];
    for (const cycle of cycles) {
        const cycleStart = getDuplicateNumber(cycle);
        if (cycleStart === -1) {
            for (let i = 1; i < cycle.length; i++) {
                result.push([cycle[i - 1], cycle[i]]);
            }
            continue;
        }
        const cycleStartIdx = cycle.indexOf(cycleStart);
        const cycle1 = cycle.slice(cycleStartIdx);
        result.push(cycle1);
        for (let i = 1; i <= cycleStartIdx; i++) {
            result.push([cycle[i - 1], cycle[i]]);
        }
    }

    const shapeData: ShapeData[] = result.map((shape, idx) => {
        let type: ShapeType;
        switch (shape.length) {
            case 2:
                type = "line";
                break;
            case 4:
                type = "triangle";
                break;
            default:
                type = "polygon";
                break;
        }
        if (type === "line") {
            const start = uniquePoints[shape[0]];
            const end = uniquePoints[shape[1]];
            return {
                type,
                data: {
                    start,
                    end,
                    distance: roundupNumber(
                        getDistance(start, end) / gridSize,
                        1,
                    ),
                    shapeId: idx + 1,
                } as LineData,
            };
        }

        const data = {
            lines: [] as LineData[],
            angles: [] as AngleData[],
        };
        const n = shape.length;
        let angleSum = 0;
        for (let i = 1; i < n; i++) {
            const line1: Line = {
                start: uniquePoints[shape[i - 1]],
                end: uniquePoints[shape[i]],
                shapeId: i,
            };

            const line2: Line = {
                end: uniquePoints[shape[i]],
                start: uniquePoints[shape[(i + 1) % n]],
                shapeId: i + 1,
            };

            data.lines.push({
                start: line1.start,
                end: line1.end,
                distance: roundupNumber(
                    getDistance(line1.start, line1.end) / gridSize,
                    1,
                ),
                shapeId: idx + 1,
            });

            let angle = roundupNumber(getAngleBetweenLines(line2, line1), 0);
            if (i === n - 1) {
                angle = roundupNumber((n - 3) * 180 - angleSum, 0);
            } else {
                angleSum += angle;
            }
            data.angles.push({
                degree: angle,
                point: line1.end,
            });
        }

        return {
            type,
            data,
        };
    });
    return shapeData;
}
