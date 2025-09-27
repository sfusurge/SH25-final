import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { CELL_SIZE } from "$lib/components/maze/Maze";
import { Vector2 } from "$lib/Vector2";
import { BlockerEntity, ScrollEntity, TrapEntity, ENTITY_TYPE, WalkerEntity, DoorEntity } from "./entities";


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


const RockSprite = loadImageToCanvas("/maze/rock.webp", 50, false, 10);

export class RoomLayout {
    width: number;
    height: number;
    left: number;
    top: number;
    right: number;
    bottom: number;
    entities: Entity[];
    staticEntities: (Entity | undefined)[][] = []; // solid, such as rocks / scroll, is always in depth sorted order.
    dynamicEntities: Entity[] = [];
    needsDoor: boolean;
    doorLocation?: [number, number];

    constructor(width: number, height: number, left: number, top: number, right: number, bottom: number, obstacleMap: number[][], needsDoor: boolean) {
        this.width = width;
        this.height = height;
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.needsDoor = needsDoor;

        this.entities = [];
        const HALFCELL = CELL_SIZE / 2;

        const emptyPositions: { row: number; col: number; pos: Vector2 }[] = [];

        for (let row = 0; row < height; row++) {
            this.staticEntities.push(new Array(this.width).fill(undefined));
            for (let col = 0; col < width; col++) {
                // +25 to send to center of cell
                const pos = new Vector2(left * CELL_SIZE + col * HALFCELL + 25, top * CELL_SIZE + row * HALFCELL + 25);

                let entity: Entity | undefined = undefined;
                switch (obstacleMap[row][col]) {
                    case ENTITY_TYPE.rock:
                        entity = new BlockerEntity(pos, RockSprite); // could use other sprites as well
                        break;
                    case ENTITY_TYPE.scroll:
                        entity = new ScrollEntity(pos);
                        break;
                    case ENTITY_TYPE.trap:
                        entity = new TrapEntity(pos);
                        break;
                    case ENTITY_TYPE.enemy:
                        entity = new WalkerEntity(pos);
                }

                if (entity) {
                    if (entity.static) {
                        this.staticEntities[row][col] = entity;
                    } else {
                        this.dynamicEntities.push(entity);
                        this.staticEntities[row][col] = undefined;
                    }
                    this.entities.push(entity);
                } else {
                    if (row !== height - 1) {
                        // Prevent being hidden by bottom wall
                        emptyPositions.push({ row, col, pos });
                    }
                    this.staticEntities[row][col] = undefined;
                }
            }
        }

        // Second pass to place door
        if (this.needsDoor && emptyPositions.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyPositions.length);
            const { row, col, pos } = emptyPositions[randomIndex];
            const doorEntity = new DoorEntity(pos);
            this.staticEntities[row][col] = doorEntity;
            this.entities.push(doorEntity);
            console.log(`Door placed at ${row}, ${col}`);
            this.doorLocation = [row, col];
        }
    }

    hasEntitiesAtPosition(x: number, y: number): boolean {

        const relativeX = x - this.left;
        const relativeY = y - this.top;


        const templateX = relativeX * 2;
        const templateY = relativeY * 2;

        return this.entities.some(entity => {

            const entityTemplateX = Math.floor((entity.x - this.left * CELL_SIZE - 25) / (CELL_SIZE / 2));
            const entityTemplateY = Math.floor((entity.y - this.top * CELL_SIZE - 25) / (CELL_SIZE / 2));

            // Check if entity is in any of the 4 template cells that make up this maze cell
            return (entityTemplateX === templateX || entityTemplateX === templateX + 1) &&
                (entityTemplateY === templateY || entityTemplateY === templateY + 1);
        });
    }
}


// TODO: MAKE SURE ALL OPEN SPOTS ARE ACCESSIBLE BY THE PLAYER
// Make each tile in room half as big as in maze
// -> dimensions have to be even
export const ROOM_TEMPLATES: RoomTemplate[] = [
    {
        id: 0, description: "Small Square", width: 3, height: 3,
        obstacleMap: [
            [0, 0, 0, 0, 1, 0],
            [1, 2, 0, 0, 2, 1],
            [1, 0, ENTITY_TYPE.enemy, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0]
        ]
    },
    {
        id: 1, description: "Small Rectangle", width: 4, height: 3,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 2, 0, 0, 1, 0, 0],
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 0, 1, 3, 0, 1, 0, 0],
            [0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ]
    },
    {
        id: 2, description: "Large Square", width: 5, height: 5,
        obstacleMap: [
            [0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
            [0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 0, 1, 1, 0, 2, 3],
            [0, 0, 1, 1, 1, 1, 1, 0, 2, 0],
            [0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    },
    {
        id: 3, description: "Large Rectangle", width: 6, height: 4,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 2, 0, 3, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
        ]
    },
    {
        id: 4, description: "Wide Rectangle", width: 7, height: 4,
        obstacleMap: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [3, 0, 0, 0, 2, 0, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    },
    {
        id: 5, description: "Large Square 2", width: 5, height: 5,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 2, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 3, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    },
    {
        id: 6, description: "8x6 Ring & Lanes", width: 8, height: 6,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 3, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, ENTITY_TYPE.enemy, 2, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
    },

    // --- Room 101: 7×7 (entities 14×14), inner ring + pockets, 3 enemies ---
    {
        id: 7, description: "7x7 Inner Ring w/ Pockets", width: 7, height: 7,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 1, 0, 2, 0, 0, 0, 0, 3, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
    },
    {
        id: 8, description: "9x6 Arena Corridors", width: 9, height: 6,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 1, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 1, 0, 1, 1, 0, 1, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, ENTITY_TYPE.enemy, 1, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1, 3, 0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0, ENTITY_TYPE.enemy, 0, 1, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 1, 0, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
    },

    // --- Room 103: 8×8 (entities 16×16) — Ring & Cross ---
    {
        id: 9, description: "8x8 Ring & Cross", width: 8, height: 8,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 1, 3, 0, 2, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 1, 2, 1, 0, 0, 2, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, ENTITY_TYPE.enemy, 0, 1, 1, 3, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 1, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
    },

    // --- Room 104: 10×5 (entities 10×20) — Double Bars ---
    {
        id: 10, description: "10x5 Double Bars", width: 10, height: 5,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, ENTITY_TYPE.enemy, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 2, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 1, 0, 0, 3, 0, 0, 0, 0, 0, 1, 0, ENTITY_TYPE.enemy, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
    },

    // --- Room 105: 7×9 (entities 18×14) — Zigzag Spine ---
    {
        id: 11, description: "7x9 Zigzag Spine", width: 7, height: 9,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
            [0, 0, 1, 1, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 1, 0, 1, ENTITY_TYPE.enemy, 0, 0, 3, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
    },

    // --- Room 106: 6×7 (entities 14×12) — Diagonals & Box ---
    {
        id: 12, description: "6x7 Diagonals & Box", width: 6, height: 7,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 2, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 1, 0, 0, 1, ENTITY_TYPE.enemy, 0, 0],
            [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 0, 2, 0, 0, 1, 0, 0, 0],
            [0, 1, 0, 1, ENTITY_TYPE.enemy, 0, 0, 3, 1, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
    },

    // --- Room 107: 9×8 (entities 16×18) — Broken Ring + Channels ---
    {
        id: 13, description: "9x8 Broken Ring + Channels", width: 9, height: 8,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1, 0, 0, 0],
            [0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 3, 0, 0, 0, 0, 0, 2, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 1, 0, 1, 0, 0],
            [0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 1, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
            [0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
    },

    // --- Room 108: 10×7 (entities 14×20) — Crossroads & Pockets ---
    {
        id: 14, description: "10x7 Crossroads & Pockets", width: 10, height: 7,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 2, 0, 0, 3, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
    },

    // --- Room 109: 8×9 (entities 18×16) — Pillars & Alleys ---
    {
        id: 15, description: "8x9 Pillars & Alleys", width: 8, height: 9,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0],
            [0, 0, 1, 0, 1, 0, 1, 2, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0],
            [0, 0, 1, 0, 1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
    },

    // --- Room 110: 6×10 (entities 20×12) — Lattice Maze ---
    {
        id: 16, description: "6x10 Lattice Maze", width: 6, height: 10,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0],
            [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 3, 0],
            [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0],
            [0, 0, 1, 0, 1, 0, 2, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
            [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0],
            [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
    },

    // --- Room 111: 10×10 (entities 20×20) — Grand Plaza w/ Quads ---
    {
        id: 17, description: "10x10 Grand Plaza w/ Quads", width: 10, height: 10,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
            [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 1, 0, 2, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 1, 0, 3, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
    },

    // --- Room 112: 7×10 (entities 20×14) — Offset Boxes & Paths ---
    {
        id: 18, description: "7x10 Offset Boxes & Paths", width: 7, height: 10,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
            [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0],
            [0, 0, 1, 0, 0, 1, 0, 2, 1, 0, 1, 0, 1, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, ENTITY_TYPE.enemy, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
            [0, 0, 1, 0, 0, 1, 0, 2, 1, 0, 1, 0, 1, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
        ],
    },
    {
        id: 19, description: "Small Square w/ Scroll", width: 3, height: 3,
        obstacleMap: [
            [0, 0, 0, 0, 1, 0],
            [1, 2, 0, 0, 0, 1],
            [1, 3, ENTITY_TYPE.enemy, 0, 0, 0],
            [0, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 2, 1],
            [0, 0, 0, 0, 1, 1]
        ]
    }
];
