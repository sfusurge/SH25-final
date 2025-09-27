import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { ENTITY_TYPE, LEFT, RIGHT, UP, DOWN } from ".";
import { Vector2 } from "$lib/Vector2";
import { debug, type MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";
import { AStar, lineOfSight } from "$lib/components/maze/PathFind";
import { CELL_SIZE } from "$lib/components/maze/Maze";
import type { RoomLayout } from "$lib/components/maze/Room";
import { GameState } from "$lib/components/maze/MazeGameState.svelte";

export class WalkerEntity extends Entity {
    static: boolean = false;

    sprite: HTMLCanvasElement;
    hurtSprite: HTMLCanvasElement;
    deadSprite: HTMLCanvasElement;

    spriteLeft: HTMLCanvasElement;
    hurtSpriteLeft: HTMLCanvasElement;
    deadSpriteLeft: HTMLCanvasElement;

    maxVel: number = 150;
    accel: number = 2000;

    // Facing direction (LEFT = 0, RIGHT = 2 to match player consts)
    facingDirection: number = RIGHT;

    // drawing for debug
    pathFinds: { x: number, y: number }[] = [];
    lineOfSight: { x: number, y: number }[] = [];
    currentRoom?: RoomLayout;
    playerLoc?: Vector2;
    directTarget = false;
    health: number = 3;
    maxHealth: number = 3;

    // Visual state management
    isHurt: boolean = false;
    hurtDuration: number = 0;
    hurtDisplayTime: number = 0.5; // seconds to show hurt sprite
    isDead: boolean = false;
    deathTime: number = 0;
    fadeOutDuration: number = 1.0; // seconds to fade out

    constructor(pos: Vector2, health?: number) {
        super(pos, 25, 25);

        // Right-facing 
        this.sprite = loadImageToCanvas("/maze/enemy_sprites/enemy_1.webp", 50, false, 0);
        this.hurtSprite = loadImageToCanvas("/maze/enemy_sprites/enemy_1_hurt.webp", 50, false, 0);
        this.deadSprite = loadImageToCanvas("/maze/enemy_sprites/enemy_1_dead.webp", 50, false, 0);

        // Left-facing 
        this.spriteLeft = loadImageToCanvas("/maze/enemy_sprites/enemy_1.webp", 50, true, 0);
        this.hurtSpriteLeft = loadImageToCanvas("/maze/enemy_sprites/enemy_1_hurt.webp", 50, true, 0);
        this.deadSpriteLeft = loadImageToCanvas("/maze/enemy_sprites/enemy_1_dead.webp", 50, true, 0);

        this.metadata.entityType = ENTITY_TYPE.enemy;
        this.health = health ?? 3;
        this.maxHealth = this.health;
    }

    onCollision(other: Entity, game?: any): void {
        // Dead entities don't participate in any collisions
        if (this.isDead) {
            return;
        }

        if (other.metadata.entityType === ENTITY_TYPE.player || other.metadata.entityType === ENTITY_TYPE.enemy) {
            this.resolveCollision(other.aabb, other.vel);
        }
        if (other.metadata.entityType === ENTITY_TYPE.projectile) {
            this.health -= 1;

            // Set hurt state when hit
            this.isHurt = true;
            this.hurtDuration = this.hurtDisplayTime;

            if (this.health <= 0 && !this.isDead) {
                this.isDead = true;
                this.deathTime = 0; // Reset death timer
                // Award points and increment counter when enemy dies
                GameState.incrementEnemiesKilled();
            }
            this.applyImpulse(this.pos.sub(other.pos).normalize().mul(600));
        }
    }

    update(game: MazeGame, dt: number): void {
        // Update hurt state timer
        if (this.isHurt && this.hurtDuration > 0) {
            this.hurtDuration -= dt;
            if (this.hurtDuration <= 0) {
                this.isHurt = false;
                this.hurtDuration = 0;
            }
        }

        // Handle death animation completion
        if (this.isDead) {
            this.deathTime += dt;
            if (this.deathTime >= this.fadeOutDuration) {
                this.metadata.destroyed = true;
            }
            // Don't process other logic when dead
            return;
        }

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

        // Only calculate line of sight if both entities are within room bounds
        if (staticEntities && staticEntities.length > 0 &&
            row >= 0 && row < staticEntities.length &&
            col >= 0 && col < staticEntities[0].length &&
            playerRow >= 0 && playerRow < staticEntities.length &&
            playerCol >= 0 && playerCol < staticEntities[0].length) {
            this.lineOfSight = lineOfSight(col, row, playerCol, playerRow);
        } else {
            this.lineOfSight = []; // Clear line of sight if out of bounds
        }
        this.currentRoom = room;

        if (player.pos.distTo(this.pos) < 2 * CELL_SIZE) {
            let clear = true;
            // check if this ent has clear los
            for (const los of this.lineOfSight) {
                // Add bounds checking to prevent accessing undefined array elements
                if (los.y >= 0 && los.y < staticEntities.length &&
                    los.x >= 0 && los.x < staticEntities[los.y].length) {
                    if (staticEntities[los.y][los.x]?.solid) {
                        clear = false;
                        break;
                    }
                }
            }

            if (clear) {
                // if close enough and have clear los, then head straight to player.
                this.directTarget = true;
                const moveVector = player.pos.sub(this.pos);

                this.facingDirection = moveVector.x > 0 ? RIGHT : LEFT;

                this.move(moveVector, dt);
                this.playerLoc = player.pos;
                this.pathFinds = [];
                return;
            }
        } else {
            this.directTarget = false;
        }

        // Only calculate pathfinding if both entities are within room bounds
        let pathFinds = null;
        if (staticEntities && staticEntities.length > 0 &&
            row >= 0 && row < staticEntities.length &&
            col >= 0 && col < staticEntities[0].length &&
            playerRow >= 0 && playerRow < staticEntities.length &&
            playerCol >= 0 && playerCol < staticEntities[0].length) {

            pathFinds = AStar(staticEntities, col, row, playerCol, playerRow);
            if (pathFinds) {
                this.pathFinds = pathFinds.map((item) => {
                    return {
                        x: item.x * halfCell + room.left * CELL_SIZE + halfCell / 2,
                        y: halfCell * item.y + room.top * CELL_SIZE + halfCell / 2
                    }
                });
            } else {
                this.pathFinds = [];
            }
        } else {
            this.pathFinds = []; // Clear pathfinding if out of bounds
        }
        const pathFind = pathFinds?.at(-1);
        if (pathFind) {
            const targetPos = Vector2.of(
                halfCell * pathFind.x + room.left * CELL_SIZE + halfCell / 2,
                halfCell * pathFind.y + room.top * CELL_SIZE + halfCell / 2
            );
            const moveVector = targetPos.sub(this.pos);
            this.facingDirection = moveVector.x > 0 ? RIGHT : LEFT;
            this.move(moveVector, dt);
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

        let currentSprite;
        if (this.isDead) {
            currentSprite = this.facingDirection === LEFT ? this.deadSpriteLeft : this.deadSprite;

            // Calculate fade alpha based on time since death
            const fadeProgress = Math.min(this.deathTime / this.fadeOutDuration, 1);
            const alpha = 1 - fadeProgress;
            ctx.globalAlpha = alpha;
        } else if (this.isHurt) {
            currentSprite = this.facingDirection === LEFT ? this.hurtSpriteLeft : this.hurtSprite;
        } else {
            currentSprite = this.facingDirection === LEFT ? this.spriteLeft : this.sprite;
        }

        ctx.drawImage(currentSprite, 0, 0);

        // Reset canvas properties
        ctx.globalAlpha = 1;

        ctx.setTransform(transform);

        // draw hitbox
        ctx.strokeRect(center.x - this.width / 2, center.y - this.height / 2, this.width, this.height)
    }
}
