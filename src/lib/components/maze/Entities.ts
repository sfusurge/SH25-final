import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { Vector2 } from "$lib/Vector2";
import { AABB } from "$lib/Vector2";
import { debug } from "$lib/components/maze/MazeGame.svelte.ts";

export const ENTITY_TYPE = Object.freeze({
    empty: 0,
    rock: 1,
    trap: 2,
    scroll: 3
}
)

const LEFT = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;
export class Player extends Entity {

    renderWidth = 50;

    // TODO player stats
    accel = 4000;
    maxVel: number = 400;

    direction = DOWN;
    playerSpites: { [key: number]: HTMLCanvasElement[] };
    constructor(pos: Vector2) {
        super(pos, 30, 25);

        this.metadata = { entityType: 'player' };

        this.playerSpites = {
            [LEFT]: [
                loadImageToCanvas("/maze/player_sprites/player_left_neutral.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_left_walk_1.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_left_walk_2.webp", this.renderWidth),
            ],
            [RIGHT]: [
                loadImageToCanvas("/maze/player_sprites/player_left_neutral.webp", this.renderWidth, true),
                loadImageToCanvas("/maze/player_sprites/player_left_walk_1.webp", this.renderWidth, true),
                loadImageToCanvas("/maze/player_sprites/player_left_walk_2.webp", this.renderWidth, true),
            ],
            [UP]: [
                loadImageToCanvas("/maze/player_sprites/player_up_neutral.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_up_walk_1.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_up_walk_2.webp", this.renderWidth),
            ],
            [DOWN]: [
                loadImageToCanvas("/maze/player_sprites/player_down_neutral.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_down_walk_1.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_down_walk_2.webp", this.renderWidth),
            ]
        };
    }

    /**
     * movement vector x,y where each value is a float [-1, 1].
     * movement should have magnitude clamped to 1 at most.
     * @param x
     * @param y
     * @param dt delta time since the last move input
     */
    onMoveInput(movement: Vector2, dt: number) {
        const mag = movement.mag();

        if (mag < 0.1) {
            movement = Vector2.ZERO;
        } else {
            const angle = movement.angle();
            if (angle >= -135 && angle <= -45) {
                this.direction = UP;
            } else if (angle >= -45 && angle < 45) {
                this.direction = RIGHT;
            } else if (angle >= 45 && angle < 135) {
                this.direction = DOWN;
            } else if (angle >= 135 || angle < -135) {
                this.direction = LEFT;
            }
        }

        this.move(movement, dt);

        debug.player = {
            vel: this.vel,
            move: movement,
            angle: this.direction
        }
    }

    onCollision(other: Entity, game?: any): void {

        const entityType = other.metadata?.entityType;

        switch (entityType) {
            case ENTITY_TYPE.rock:
                break;

            case ENTITY_TYPE.trap:
                break;

            case ENTITY_TYPE.scroll:
                break;
        }
    }

    // encapsulated wall collisions a bit
    resolveWallCollision(wallAABB: AABB): void {
        this.resolveCollision(wallAABB);
    }

    render(ctx: CanvasRenderingContext2D, time: number): void {
        const trans = ctx.getTransform();

        const mag = this.vel.mag();
        const sprites = this.playerSpites[this.direction];

        let sprite = sprites[0];
        if (mag > 0.1) {
            debug.time = time;
            if (Math.round((time % 1000) / 250) % 2 === 0) { // alternate animation every 250 ms
                sprite = sprites[1];
            } else {
                sprite = sprites[2];
            }
        }

        ctx.translate(0, this.height / 2); // translate origin to bottom of player, then offset by image size
        ctx.translate(-sprite.width / 2, -sprite.height);
        ctx.drawImage(sprite, this.x, this.y);

        ctx.setTransform(trans);
    }
}

const RockSprite = loadImageToCanvas("/maze/rock_PLACEHOLDER.png", 50, false, 10);
const ScrollSprite = loadImageToCanvas("/maze/scroll.png", 50, false, 20);
const TrapSprite = loadImageToCanvas("/maze/trap.png", 50, false, 10);

export class BlockerEntity extends Entity {

    static = true;
    sprite: HTMLCanvasElement;

    constructor(pos: Vector2, sprite: HTMLCanvasElement) {
        super(pos, 50, 50);
        this.sprite = RockSprite;
        this.metadata = { entityType: ENTITY_TYPE.rock };
    }

    onCollision(other: Entity, game?: any): void {
        // Make other entity move away idk
        // TODO: optimize?

        if (!other.static) {
            other.resolveCollision(this.aabb);
        }
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

    onCollision(other: Entity, game?: any): void {
        if (other.metadata?.entityType === 'player') {
            // TODO
        }
    }

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

    onCollision(other: Entity, game?: any): void {
        if (other.metadata?.entityType === 'player') {
            // TODO
        }
    }

    render(ctx: CanvasRenderingContext2D, time: number): void {
        const aabb = this.aabb;
        ctx.drawImage(this.sprite, aabb.x, aabb.y, aabb.width, aabb.height);
    }
}
