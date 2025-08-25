import { Maze, CELL_TYPE } from "$lib/components/maze/Maze";
import { RoomGenerator, type Room } from "./generationUtils/RoomGenerator";
import { PathGenerator } from "./generationUtils/PathGenerator";

// TODO: Optimize space?
export type Cell = {
    walls: number;
    regionID: number; // for generating rooms and paths; not for identification
};

export class MazeGenerator {
    width: number;
    height: number;
    attempts: number;
    windingPercent: number;
    rectangularity: number;
    randomOpenPercent: number;
    map: Cell[][];
    rooms: Room[] = [];
    regionIDCounter: number = 1;
    private roomGenerator: RoomGenerator;
    private pathGenerator: PathGenerator;


    constructor(
        width: number,
        height: number,
        attempts: number,
        minRoomSize: number = 3,
        maxRoomSize: number = 7,
        windingPercent: number = 60,
        rectangularity: number = 3,
        randomOpenPercent: number = 0.02
    ) {
        this.width = width;
        this.height = height;
        this.attempts = attempts;
        this.windingPercent = windingPercent;
        this.rectangularity = rectangularity;
        this.randomOpenPercent = randomOpenPercent;
        this.roomGenerator = new RoomGenerator(width, height, minRoomSize, maxRoomSize);
        this.pathGenerator = new PathGenerator(width, height);
        this.map = Array.from({ length: width }, () =>
            Array.from({ length: height }, () => ({
                walls: 0b1111, // Start with all walls
                regionID: 0 // unvisited
            }))
        );
    }

    generate(): Maze {
        [this.rooms, this.regionIDCounter] = this.roomGenerator.generateRooms(this.map, this.attempts, this.rectangularity);
        this.pathGenerator.generateMazePaths(this.map, this.windingPercent, this.regionIDCounter);
        this.pathGenerator.connectRegions(this.map, this.rooms, this.randomOpenPercent);
        this.pathGenerator.removeDeadEnds(this.map,);
        return this.mapToMaze();
    }

    // TODO: optimize, or just alter the Maze class altogether so don't need transformation??
    // converts generation map to maze class format
    private mapToMaze(): Maze {
        const map: number[][] = [];

        for (let y = 0; y < this.height; y++) {
            map[y] = [];
            for (let x = 0; x < this.width; x++) {
                const cell = this.map[x][y];
                map[y][x] = cell.walls;
            }
        }

        const maze = new Maze(this.width, this.height, map);
        return maze;
    }

}