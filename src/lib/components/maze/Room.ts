import { CELL_TYPE } from "$lib/components/maze/Maze";
import type { Cell } from "$lib/components/maze/MazeGenerator";

export type Room = {
    regionID: number;
    templateID?: number;
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
};

export const ROOM_TEMPLATES: RoomTemplate[] = [
    { id: 1, description: "Small Square", width: 3, height: 3 },
    { id: 2, description: "Small Rectangle", width: 4, height: 3 },
    { id: 3, description: "Medium Square", width: 5, height: 5 },
    { id: 4, description: "Medium Rectangle", width: 6, height: 4 },
    { id: 5, description: "Large Square", width: 7, height: 7 },
    { id: 6, description: "Large Rectangle", width: 8, height: 5 },
    { id: 7, description: "Long Rectangle", width: 7, height: 3 },
    { id: 8, description: "Grand Hall", width: 9, height: 6 },
];
