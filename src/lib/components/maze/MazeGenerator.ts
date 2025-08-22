import { Maze, WALL_TYPE } from "$lib/components/maze/Maze";
import { RoomGenerator, type Rect } from "./generationUtils/RoomGenerator";
import { PathGenerator } from "./generationUtils/PathGenerator";

// TODO: Optimize space?
type Cell = {
    walls: number;
    visited: boolean;
};

export class MazeGenerator {
    width: number;
    height: number;
    attempts: number;
    map: Cell[][];
    private roomGenerator: RoomGenerator;
    private pathGenerator: PathGenerator;
    private rooms: Rect[] = [];

    constructor(
        width: number,
        height: number,
        attempts: number,
        minRoomSize: number = 3,
        maxRoomSize: number = 7
    ) {
        this.width = width;
        this.height = height;
        this.attempts = attempts;
        this.roomGenerator = new RoomGenerator(width, height, minRoomSize, maxRoomSize);
        this.pathGenerator = new PathGenerator(width, height);
        this.map = Array.from({ length: width }, () =>
            Array.from({ length: height }, () => ({
                walls: 15, // Start with all walls
                visited: false
            }))
        );
    }

    generate(): Maze {
        this.rooms = this.roomGenerator.generateRooms(this.map, this.attempts);
        this.pathGenerator.generateMazePaths(this.map);
        return this.mapToMaze();
    }

    // TODO: optimize, or just alter the Maze class altogether so don't need transformation??
    // converts generation map to maze class format
    private mapToMaze(): Maze {
        const maze = new Maze(this.width, this.height);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.map[x][y];
                maze.map[y * this.width + x] = cell.walls;
            }
        }
        return maze;
    }

}