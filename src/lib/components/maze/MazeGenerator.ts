import { Maze, WALL_TYPE } from "$lib/components/maze/Maze";

export class MazeGenerator {
    width: number;
    height: number;
    attempts: number;
    maze: Maze;

    constructor(width: number, height: number, attempts: number) {
        this.width = width;
        this.height = height;
        this.attempts = attempts;
        this.maze = new Maze(width, height);
    }

    generate(): Maze {

        // dummy
        const map = [
            [7, 3, 10, 2, 6],
            [5, 13, 3, 12, 13],
            [9, 6, 9, 10, 6],
            [7, 5, 3, 6, 5],
            [9, 8, 12, 9, 12]
        ];
        this.maze.map = new Int32Array(map.flat());
        return this.maze;
    }
}