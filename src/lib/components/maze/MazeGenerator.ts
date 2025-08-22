import { Maze, WALL_TYPE } from "$lib/components/maze/Maze";


type Rect = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};

export class MazeGenerator {
    width: number;
    height: number;
    attempts: number;
    maze: Maze;
    private rooms: Rect[] = [];
    private minRoomSize: number;
    private maxRoomSize: number;

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
        this.minRoomSize = minRoomSize;
        this.maxRoomSize = maxRoomSize;
        this.maze = new Maze(width, height);
    }

    generate(): Maze {

        this.generateRooms();
        return this.maze;
    }

    /* Room generation logic */ 

    // main room generation function: adds rooms to the maze
    private generateRooms(): void {
        for (let i = 0; i < this.attempts; i++) {

            const sizeRange = this.maxRoomSize - this.minRoomSize + 1;

            // borrowing size specification code from dart example
            const size = Math.floor(Math.random() * sizeRange) + this.minRoomSize;
            const rectangularity = Math.floor(Math.random() * 3);

            let width = size;
            let height = size;
            if (Math.random() < 0.5) {
                width += rectangularity;
            } else {
                height += rectangularity;
            }

            if (this.tryAddRoom(width, height)) {
                console.log(`Room placed: ${width}x${height}`);
            }
        }

        for (const room of this.rooms) {
            this.placeRoomInMaze(room);
        }
    }


    private placeRoomInMaze(room: Rect): void {

        // Add walls

        // Horizontal
        for (let x = room.x1; x < room.x2; x++) {
            this.maze.map[room.y1 * this.width + x] |= WALL_TYPE.UP;
            this.maze.map[(room.y2 - 1) * this.width + x] |= WALL_TYPE.DOWN;
        }

        // Vertical
        for (let y = room.y1; y < room.y2; y++) {
            this.maze.map[y * this.width + room.x1] |= WALL_TYPE.LEFT;
            this.maze.map[y * this.width + (room.x2 - 1)] |= WALL_TYPE.RIGHT;
        }

    }

    private tryAddRoom(width: number, height: number): boolean {

        const x1 = Math.floor(Math.random() * (this.width - width + 1));
        const y1 = Math.floor(Math.random() * (this.height - height + 1));
        const x2 = x1 + width;
        const y2 = y1 + height;

        const newRoom: Rect = { x1, y1, x2, y2 };

        // Collision check w/ existing rooms
        for (const room of this.rooms) {
            if (this.rectsIntersect(newRoom, room)) {
                return false;
            }
        }
        this.rooms.push(newRoom);
        return true;
    }

    private rectsIntersect(r1: Rect, r2: Rect): boolean {
        return r1.x1 < r2.x2 && r1.x2 > r2.x1 && r1.y1 < r2.y2 && r1.y2 > r2.y1;
    }


}