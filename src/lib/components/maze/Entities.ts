import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { Vector2 } from "$lib/Vector2";
import { AABB } from "$lib/Vector2";
import { debug, type MazeGame } from "$lib/components/maze/MazeGame.svelte.ts";
import { AStar, lineOfSight } from "$lib/components/maze/PathFind";
import { CELL_SIZE } from "$lib/components/maze/Maze";
import type { Room, RoomLayout } from "$lib/components/maze/Room";

export const ENTITY_TYPE = Object.freeze({
    player: -1,
    empty: 0,
    rock: 1,
    trap: 2,
    scroll: 3,
    enemy1: 4,
});

const LEFT = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;
export class Player extends Entity {
    renderWidth = 50;

    // TODO player stats
    accel = 3500;
    maxVel: number = 400;

    direction = DOWN;
    playerSpites: { [key: number]: HTMLCanvasElement[] };

    immuneDuration = 0;

    constructor(pos: Vector2) {
        super(pos, 30, 25);

        this.metadata = { entityType: ENTITY_TYPE.player };

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

    update(game: MazeGame, dt: number): void {
        if (this.immuneDuration > 0) {
            this.immuneDuration -= dt;
        }
    }

    onCollision(other: Entity, game?: any): void {

        if (other.metadata.entityType === ENTITY_TYPE.enemy1 && this.immuneDuration <= 0) {
            this.applyImpulse(this.pos.sub(other.pos).normalize().muli(500));
            this.immuneDuration = 1;
        }
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

const RockSprite = loadImageToCanvas("/maze/rock_PLACEHOLDER.webp", 40, false, 0);
const ScrollSprite = loadImageToCanvas("/maze/scroll.webp", 40, false, 0);
const TrapSprite = loadImageToCanvas("/maze/trap.webp", 50, false, 0);

export class BlockerEntity extends Entity {
    solid = true;
    static = true;
    sprite: HTMLCanvasElement;

    constructor(pos: Vector2, sprite: HTMLCanvasElement) {
        super(pos, 40, 40);
        this.sprite = RockSprite;
        this.metadata = { entityType: ENTITY_TYPE.rock };
    }

    onCollision(other: Entity, game?: MazeGame): void {
        // TODO: optimize?

        if (!other.static) {
            other.resolveCollision(this.aabb);
        }
    }

    // static, no updates

    render(ctx: CanvasRenderingContext2D, time: number): void {
        // TODO
        const aabb = this.aabb;
        const center = aabb.center;
        ctx.drawImage(this.sprite, aabb.x, aabb.y);
        ctx.strokeStyle = "green";
        ctx.strokeRect(center.x - this.width / 2, center.y - this.height / 2, this.width, this.height);
    }
}

export class ScrollEntity extends Entity {
    static = true;
    sprite: HTMLCanvasElement;

    constructor(pos: Vector2) {
        super(pos, 40, 40);
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
        const center = aabb.center
        ctx.drawImage(this.sprite, center.x - this.sprite.width / 2, center.y - this.sprite.height / 2);
        ctx.strokeStyle = "red";
        ctx.strokeRect(center.x - this.sprite.width / 2, center.y - this.sprite.height / 2, this.sprite.width, this.sprite.height);

        ctx.strokeStyle = "green";
        ctx.strokeRect(center.x - this.width / 2, center.y - this.height / 2, this.width, this.height);
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
        ctx.drawImage(this.sprite, aabb.x, aabb.y);
    }
}

export class WalkerEntity extends Entity {
    static: boolean = false;

    sprite: HTMLCanvasElement;

    maxVel: number = 150;
    accel: number = 2000;

    // drawing for debug
    pathFinds: { x: number, y: number }[] = [];
    lineOfSight: { x: number, y: number }[] = [];
    currentRoom?: RoomLayout;
    playerLoc?: Vector2;
    directTarget = false;

    constructor(pos: Vector2) {
        super(pos, 25, 25);

        this.sprite = loadImageToCanvas("/maze/enemy_sprites/enemy_1.webp", 50, false, 0);
        this.metadata.entityType = ENTITY_TYPE.enemy1;
    }

    onCollision(other: Entity, game?: any): void {
        if (other.metadata.entityType === ENTITY_TYPE.player || other.metadata.entityType === ENTITY_TYPE.enemy1) {
            this.resolveCollision(other.aabb, other.vel);
        }
    }

    update(game: MazeGame, dt: number): void {
        if (game.currentRoomId === 0) {
            return;
        }

        const player = game.player;
        const room = game.idToRoomLayout[game.currentRoomId];
        const staticEntities = room.staticEntities;
        const halfCell = CELL_SIZE / 2;

        const row = (Math.floor(this.y / halfCell) - (room.top * 2));
        const col = (Math.floor(this.x / halfCell) - (room.left * 2));
        const playerRow = (Math.floor(player.y / halfCell) - (room.top * 2));
        const playerCol = (Math.floor(player.x / halfCell) - (room.left * 2));

        this.lineOfSight = lineOfSight(col, row, playerCol, playerRow);
        this.currentRoom = room;

        if (player.pos.distTo(this.pos) < 2 * CELL_SIZE) {
            let clear = true;
            // check if this ent has clear los
            for (const los of this.lineOfSight) {
                if (staticEntities[los.y][los.x]?.solid) {
                    clear = false;
                    break;
                }
            }

            if (clear) {
                // if close enough and have clear los, then head straight to player.
                this.directTarget = true;
                this.move(player.pos.sub(this.pos), dt);
                this.playerLoc = player.pos;
                this.pathFinds = [];
                return;
            }
        } else {
            this.directTarget = false;
        }

        const pathFinds = AStar(staticEntities, col, row, playerCol, playerRow);
        if (pathFinds) {
            this.pathFinds = pathFinds.map((item) => {
                return {
                    x: item.x * halfCell + room.left * CELL_SIZE + halfCell / 2,
                    y: halfCell * item.y + room.top * CELL_SIZE + halfCell / 2
                }
            });
        }
        const pathFind = pathFinds?.at(-1);
        if (pathFind) {
            this.move(Vector2.of(
                halfCell * pathFind.x + room.left * CELL_SIZE + halfCell / 2,
                halfCell * pathFind.y + room.top * CELL_SIZE + halfCell / 2
            ).sub(this.pos), dt);
        }
    }

    render(ctx: CanvasRenderingContext2D, time: number): void {
        const mag = this.vel.mag();

        let verOffset = 0;
        let angleOffset = 0;

        // bounce animation
        if (mag > 0.5) {
            const period = ((time % 1000) / 1000) * Math.PI * 2;
            verOffset = Math.abs(Math.sin(period) * 10); // 15px bounce
            angleOffset = Math.cos(period) * Math.PI / 30;
        }

        // draw path finding dot
        const transform = ctx.getTransform();
        ctx.strokeStyle = "#7daea3"
        const center = this.aabb.center;

        // draw direct targeting
        if (this.directTarget && this.playerLoc) {
            ctx.strokeStyle = "#d8a657";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.playerLoc.x, this.playerLoc.y);
            ctx.stroke();
        }

        // draw path finding path
        if (this.pathFinds && this.pathFinds.length > 0) {
            ctx.beginPath()
            ctx.moveTo(this.pathFinds[0].x, this.pathFinds[0].y);

            for (let i = 0; i < this.pathFinds.length; i++) {
                const cur = this.pathFinds[i];
                ctx.lineTo(cur.x, cur.y);
            }
            ctx.stroke();

            ctx.fillStyle = '#7daea3';
            const last = this.pathFinds.at(-1)!;
            ctx.fillRect(last.x - 5, last.y - 5, 10, 10);
        }

        // draw line of sight
        ctx.fillStyle = "#e78a4e33";
        const halfCell = CELL_SIZE * 0.5;
        if (this.lineOfSight && this.currentRoom) {

            for (const los of this.lineOfSight) {
                ctx.fillRect(los.x * halfCell + this.currentRoom.left * CELL_SIZE,
                    los.y * halfCell + this.currentRoom.top * CELL_SIZE,
                    halfCell,
                    halfCell
                );
            }
        }




        ctx.translate(this.x, this.y + verOffset + this.height / 2);
        ctx.rotate(angleOffset);
        ctx.translate(-this.sprite.width / 2, -this.sprite.height);

        ctx.drawImage(this.sprite, 0, 0);

        ctx.setTransform(transform);

        // draw hitbox
        ctx.strokeRect(center.x - this.width / 2, center.y - this.height / 2, this.width, this.height)
    }
}