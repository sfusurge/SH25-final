import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { CELL_SIZE } from "$lib/components/maze/Maze";
import { Vector2 } from "$lib/Vector2";


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

const RockSprite = loadImageToCanvas("/maze/rock_PLACEHOLDER.png", 50, false, 10);
const ScrollSprite = loadImageToCanvas("/maze/scroll.png", 50, false, 20);
const TrapSprite = loadImageToCanvas("/maze/trap.png", 50, false, 10);

export class BlockerEntity extends Entity {

    static = true;
    sprite: HTMLCanvasElement;

    constructor(pos: Vector2, sprite: HTMLCanvasElement) {
        super(pos, 50, 50);
        this.sprite = sprite;
        this.metadata = { entityType: ENTITY_TYPE.rock };
    }

    // static, no updates

    render(ctx: CanvasRenderingContext2D, time: number): void {
        // TODO
        const aabb = this.aabb;
        ctx.drawImage(this.sprite, aabb.x, aabb.y, aabb.width, aabb.height);
    }
}

export class ScrollEntity extends Entity {
    static = true;
    sprite: HTMLCanvasElement;

    constructor(pos: Vector2) {
        super(pos, 30, 30);
        this.sprite = ScrollSprite;
        this.metadata = { entityType: ENTITY_TYPE.scroll };
    }

    // TODO add collision event with player to maybe give some power ups?

    render(ctx: CanvasRenderingContext2D, time: number): void {
        const aabb = this.aabb;
        ctx.drawImage(this.sprite, aabb.x, aabb.y, aabb.width, aabb.height);
    }
}


export class TrapEntity extends Entity {
    static = true;
    sprite: HTMLCanvasElement;

    constructor(pos: Vector2) {
        super(pos, 40, 40);
        this.sprite = TrapSprite;
        this.metadata = { entityType: ENTITY_TYPE.trap };
    }

    // TODO add collision event with player to maybe give some power ups?

    render(ctx: CanvasRenderingContext2D, time: number): void {
        const aabb = this.aabb;
        ctx.drawImage(this.sprite, aabb.x, aabb.y, aabb.width, aabb.height);
    }
}



export class RoomLayout {
    width: number;
    height: number;
    left: number;
    top: number;
    right: number;
    bottom: number;
    entities: Entity[];

    constructor(width: number, height: number, left: number, top: number, right: number, bottom: number, obstacleMap: number[][]) {
        this.width = width;
        this.height = height;
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;

        this.entities = [];
        const HALFCELL = CELL_SIZE / 2;
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                // +25 to send to center of cell


                const pos = new Vector2(left * CELL_SIZE + col * HALFCELL + 25, top * CELL_SIZE + row * HALFCELL + 25) // TODO maybe replace all magic numbers with CELL_SIZE fractions? maybe not
                // console.log(pos);

                switch (obstacleMap[row][col]) {
                    case ENTITY_TYPE.rock:
                        this.entities.push(new BlockerEntity(pos, RockSprite)); // could use other sprites as well
                        break;
                    case ENTITY_TYPE.scroll:
                        this.entities.push(new ScrollEntity(pos));
                        break;
                    case ENTITY_TYPE.trap:
                        this.entities.push(new TrapEntity(pos));
                        break;
                }
            }
        }
    }


    hasEntitiesAtPosition(x: number, y: number): boolean {

        const relativeX = x - this.left;
        const relativeY = y - this.top;

        const templateX = Math.floor(relativeX * this.width / (this.right - this.left));
        const templateY = Math.floor(relativeY * this.height / (this.bottom - this.top));

        // Check if there are any entities at this position
        return this.entities.some(entity => {
            // Convert entity position back to template coordinates
            const entityTemplateX = Math.floor((entity.x - this.left * CELL_SIZE) / (CELL_SIZE / 2));
            const entityTemplateY = Math.floor((entity.y - this.top * CELL_SIZE) / (CELL_SIZE / 2));

            return entityTemplateX === templateX && entityTemplateY === templateY;
        });
    }
}

export const ENTITY_TYPE = Object.freeze({
    empty: 0,
    rock: 1,
    trap: 2,
    scroll: 3
}
)


// Make each tile in room half as big as in maze
// -> dimensions have to be even
export const ROOM_TEMPLATES: RoomTemplate[] = [
    {
        id: 0, description: "Small Square", width: 3, height: 3,
        obstacleMap: [
            [0, 0, 0, 0, 1, 0],
            [1, 2, 0, 0, 2, 1],
            [1, 0, 0, 0, 0, 0],
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
            [0, 0, 0, 0, 0, 0, 0, 0],
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
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
            [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
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
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    },
    {
        id: 5, description: "Large Square 2", width: 5, height: 5,
        obstacleMap: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 2, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 3, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    }
];
