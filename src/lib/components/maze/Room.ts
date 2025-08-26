import { CELL_TYPE } from "$lib/components/maze/Maze";
import type { Cell } from "$lib/components/maze/MazeGenerator";

export type Room = {
    regionID: number;
    templateID: number;
    flipSize: boolean;
    flipHorizontal: boolean;
    flipVertical: boolean;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};

export type RoomTemplate = {
    id: number;
    description: string;
    width: number;
    height: number;
    obstacleMap: number[][];
};

export const ROOM_TEMPLATES: RoomTemplate[] = [
    {
        id: 0, description: "Small Square", width: 3, height: 3,
        obstacleMap: [
            [0, 0, 0],
            [1, 0, 0],
            [1, 0, 0]
        ]
    },
    {
        id: 1, description: "Small Rectangle", width: 4, height: 3,
        obstacleMap: [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ]
    },
    {
        id: 2, description: "Large Square", width: 5, height: 5,
        obstacleMap: [
            [0, 0, 0, 1, 1],
            [0, 1, 0, 0, 0],
            [0, 1, 1, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ]
    },
    {
        id: 3, description: "Large Rectangle", width: 6, height: 4,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 0, 0],
            [0, 0, 0, 1, 0, 0]
        ]
    },
    {
        id: 4, description: "Wide Rectangle", width: 7, height: 4,
        obstacleMap: [
            [1, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0]
        ]
    },
    {
        id: 5, description: "Large Square 2", width: 5, height: 5,
        obstacleMap: [

            [0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0],
        ]
    }
];
