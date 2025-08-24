import { CELL_TYPE } from "$lib/components/maze/Maze";
import type { Cell } from "$lib/components/maze/MazeGenerator";

export type Room = {
    id: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};


export class RoomGenerator {
    private rooms: Room[] = [];
    private minRoomSize: number;
    private maxRoomSize: number;
    private width: number;
    private height: number;
    private regionIDCounter: number = 1;
    private roomIDCounter = 1;

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

    /** Main function: generates rooms on the map (returns generated rooms also) 
     * @param map
     * @param attempts
     */
    generateRooms(map: Cell[][], attempts: number, rectangularity: number): [Room[], number] {
        this.rooms = [];

        for (let i = 0; i < attempts; i++) {
            const sizeRange = this.maxRoomSize - this.minRoomSize + 1;

            // borrowing size specification code from dart example
            const size = Math.floor(Math.random() * sizeRange) + this.minRoomSize;
            const rectangleModifier = Math.floor(Math.random() * rectangularity);

            let width = size;
            let height = size;
            if (Math.random() < 0.5) {
                width += rectangleModifier;
            } else {
                height += rectangleModifier;
            }
            // TODO place rooms from a predetermined list 
            this.tryAddRoom(width, height)
        }

        // Place all rooms in the map
        for (const room of this.rooms) {
            this.placeRoomInMap(room, map);
        }

        return [[...this.rooms], this.regionIDCounter]; // Return copy of rooms array
    }

    private tryAddRoom(width: number, height: number): boolean {
        const x1 = Math.floor(Math.random() * (this.width - width + 1));
        const y1 = Math.floor(Math.random() * (this.height - height + 1));
        const x2 = x1 + width;
        const y2 = y1 + height;

        const newRoom: Room = { id: 0, x1, y1, x2, y2 };

        // Collision check w/ existing rooms
        for (const room of this.rooms) {
            if (this.rectsIntersect(newRoom, room)) {
                return false;
            }
        }
        newRoom.id = this.roomIDCounter;
        this.roomIDCounter += 1;
        this.rooms.push(newRoom);
        return true;
    }

    private placeRoomInMap(room: Room, map: Cell[][]): void {
        // Clear out room; mark room as visited
        this.regionIDCounter++;
        for (let x = room.x1; x < room.x2; x++) {
            for (let y = room.y1; y < room.y2; y++) {
                map[x][y].regionID = this.regionIDCounter;
                // set room id within cell value, shift 14 bits to match roomid mask.
                map[x][y].walls = room.id << 8; // Remove all walls for inner room cells
            }
        }

        // Add walls

        for (let x = room.x1; x < room.x2; x++) {
            map[x][room.y1].walls |= CELL_TYPE.UP;
            map[x][room.y2 - 1].walls |= CELL_TYPE.DOWN;
        }

        for (let y = room.y1; y < room.y2; y++) {
            map[room.x1][y].walls |= CELL_TYPE.LEFT;
            map[room.x2 - 1][y].walls |= CELL_TYPE.RIGHT;
        }


    }

    private rectsIntersect(r1: Room, r2: Room): boolean {
        return r1.x1 < r2.x2 && r1.x2 > r2.x1 && r1.y1 < r2.y2 && r1.y2 > r2.y1;
    }

}
