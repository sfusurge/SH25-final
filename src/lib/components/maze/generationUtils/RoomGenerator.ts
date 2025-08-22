import { WALL_TYPE } from "$lib/components/maze/Maze";

export type Rect = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};

type Cell = {
    walls: number;
    visited: boolean;
};

export class RoomGenerator {
    private rooms: Rect[] = [];
    private minRoomSize: number;
    private maxRoomSize: number;
    private width: number;
    private height: number;

    constructor(
        width: number,
        height: number,
        minRoomSize: number = 3,
        maxRoomSize: number = 7
    ) {
        this.width = width;
        this.height = height;
        this.minRoomSize = minRoomSize;
        this.maxRoomSize = maxRoomSize;
    }

    // Main function: generates rooms on the map (returns generated rooms also)
    generateRooms(map: Cell[][], attempts: number): Rect[] {
        this.rooms = [];

        for (let i = 0; i < attempts; i++) {
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

            this.tryAddRoom(width, height)
        }

        // Place all rooms in the map
        for (const room of this.rooms) {
            this.placeRoomInMap(room, map);
        }

        return [...this.rooms]; // Return copy of rooms array
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

    private placeRoomInMap(room: Rect, map: Cell[][]): void {
        // Add walls

        // Horizontal
        for (let x = room.x1; x < room.x2; x++) {
            map[x][room.y1].walls |= WALL_TYPE.UP;
            map[x][room.y2 - 1].walls |= WALL_TYPE.DOWN;
        }

        // Vertical
        for (let y = room.y1; y < room.y2; y++) {
            map[room.x1][y].walls |= WALL_TYPE.LEFT;
            map[room.x2 - 1][y].walls |= WALL_TYPE.RIGHT;
        }

        // mark room as visited
        for (let x = room.x1; x < room.x2; x++) {
            for (let y = room.y1; y < room.y2; y++) {
                map[x][y].visited = true;
            }
        }
    }

    private rectsIntersect(r1: Rect, r2: Rect): boolean {
        return r1.x1 < r2.x2 && r1.x2 > r2.x1 && r1.y1 < r2.y2 && r1.y2 > r2.y1;
    }

}
