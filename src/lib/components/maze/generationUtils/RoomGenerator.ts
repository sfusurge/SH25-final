import { CELL_TYPE } from "$lib/components/maze/Maze";
import type { Cell } from "$lib/components/maze/MazeGenerator";
import { type Room, ROOM_TEMPLATES, RoomLayout, type RoomTemplate } from "$lib/components/maze/Room";


export class RoomGenerator {
    private rooms: Room[] = [];
    private minRoomSize: number;
    private maxRoomSize: number;
    private width: number;
    private height: number;
    private regionIDCounter: number = 1;
    private roomIDCounter = 1;
    private needsDoor: boolean = true;

    idToRoomTemplate: { [key: number | string]: RoomLayout } = {};

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
            const randomIndex = Math.floor(Math.random() * ROOM_TEMPLATES.length);
            const template = ROOM_TEMPLATES[randomIndex];
            this.tryAddRoom(template);
        }

        // Place all rooms in the map
        for (const room of this.rooms) {
            this.placeRoomInMap(room, map);
        }

        return [[...this.rooms], this.regionIDCounter]; // Return copy of rooms array
    }

    private tryAddRoom(template: RoomTemplate): boolean {
        const flipSize = Math.random() < 0.5;
        const flipHorizontal = Math.random() < 0.5;
        const flipVertical = Math.random() < 0.5;
        const roomWidth = flipSize ? template.height : template.width;
        const roomHeight = flipSize ? template.width : template.height;

        const x1 = Math.floor(Math.random() * (this.width - roomWidth + 1));
        const y1 = Math.floor(Math.random() * (this.height - roomHeight + 1));
        const x2 = x1 + roomWidth;
        const y2 = y1 + roomHeight;

        const newRoom: Room = {
            regionID: this.roomIDCounter,
            templateID: template.id,
            flipSize,
            flipHorizontal,
            flipVertical,
            x1,
            y1,
            x2,
            y2
        };

        // Collision check w/ existing rooms
        for (const room of this.rooms) {
            if (this.rectsIntersect(newRoom, room)) {
                return false;
            }
        }
        this.roomIDCounter += 1;
        this.rooms.push(newRoom);
        return true;
    }

    private placeRoomInMap(room: Room, map: Cell[][]): void {
        // Clear out room; mark room as visited
        this.regionIDCounter++;

        // create copy
        let obstacleMap = ROOM_TEMPLATES[room.templateID].obstacleMap.map(row => [...row]);

        if (room.flipVertical) {
            obstacleMap.reverse();
        }
        if (room.flipHorizontal) {
            for (let i = 0; i < obstacleMap.length; i++) {
                obstacleMap[i].reverse();
            }
        }
        if (room.flipSize) {
            // Transpose the matrix for size flip
            const transposed = obstacleMap[0].map((_, colIndex) =>
                obstacleMap.map(row => row[colIndex])
            );
            obstacleMap = transposed;
        }

        for (let x = room.x1; x < room.x2; x++) {
            for (let y = room.y1; y < room.y2; y++) {

                map[x][y].regionID = this.regionIDCounter;
                // set room id within cell value, shift 8 bits to match roomid mask.
                map[x][y].typeBits = room.regionID << 8;

                // Calculate relative coordinates within the room
                // const relativeX = x - room.x1;
                // const relativeY = y - room.y1;

                // map[x][y].typeBits |= obstacleMap[relativeY][relativeX] << 14;
            }
        }

        this.idToRoomTemplate[room.regionID] = new RoomLayout(
            obstacleMap[0].length,
            obstacleMap.length,
            room.x1,
            room.y1,
            room.x2,
            room.y2,
            obstacleMap,
            this.needsDoor
        );

        this.needsDoor = false;

        // Add walls
        for (let x = room.x1; x < room.x2; x++) {
            map[x][room.y1].typeBits |= CELL_TYPE.UP;
            map[x][room.y2 - 1].typeBits |= CELL_TYPE.DOWN;
        }

        for (let y = room.y1; y < room.y2; y++) {
            map[room.x1][y].typeBits |= CELL_TYPE.LEFT;
            map[room.x2 - 1][y].typeBits |= CELL_TYPE.RIGHT;
        }
    }

    private rectsIntersect(r1: Room, r2: Room): boolean {
        return r1.x1 < r2.x2 && r1.x2 > r2.x1 && r1.y1 < r2.y2 && r1.y2 > r2.y1;
    }

}
