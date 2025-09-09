import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { Vector2 } from "$lib/Vector2";
import { AABB } from "$lib/Vector2";
import { debug, type MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";
import { AStar, lineOfSight } from "$lib/components/maze/PathFind";
import { CELL_SIZE } from "$lib/components/maze/Maze";
import type { Room, RoomLayout } from "$lib/components/maze/Room";

export const ENTITY_TYPE = Object.freeze({
    player: -1,
    empty: 0,
    rock: 1,
    trap: 2,
    scroll: 3,
    enemy: 4,
    projectile: 5,
});

const LEFT = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;



export class ProjectileEntity extends Entity {
    direction: number;
    speed: number = 400;
    distanceBeforeDrop: number = 150;
    distanceTraveled: number = 0;
    initialVelocity: Vector2; // Velocity inherited from player

    height: number = 15; // Height above ground
    verticalVelocity: number = 0;
    gravity: number = 250;
    radius: number = 6;

    constructor(pos: Vector2, direction: number, initialVelocity: Vector2 = Vector2.ZERO) {
        super(pos, 8, 8);
        this.direction = direction;
        this.initialVelocity = initialVelocity.clone();

        this.metadata = { entityType: ENTITY_TYPE.projectile };
    }

    update(game: MazeGame, dt: number): void {
        // Calculate movement vector based on direction
        let moveVector = Vector2.ZERO;
        switch (this.direction) {
            case LEFT:
                moveVector = new Vector2(-1, 0);
                break;
            case RIGHT:
                moveVector = new Vector2(1, 0);
                break;
            case UP:
                moveVector = new Vector2(0, -1);
                break;
            case DOWN:
                moveVector = new Vector2(0, 1);
                break;
        }

        const baseMovement = moveVector.mul(this.speed * dt);
        const inheritedMovement = this.initialVelocity.mul(dt);
        const totalMovement = baseMovement.add(inheritedMovement);

        this.pos.addi(totalMovement);
        this.distanceTraveled += baseMovement.mag(); // Only count base movement for max distance


        if (this.distanceTraveled < this.distanceBeforeDrop) {
            this.height = 15;
            this.verticalVelocity = 0;
        } else {
            this.verticalVelocity -= this.gravity * dt; // Apply gravity (becomes negative)
            this.height += this.verticalVelocity * dt;
        }

        // Projectile hits the ground
        if (this.height <= 0) {
            this.height = 0;
            this.metadata.destroyed = true;
        }
    }

    onCollision(other: Entity, game?: MazeGame): void {
        const entityType = other.metadata?.entityType;

        // Destroy projectile on collision with solid objects
        if (
            entityType === ENTITY_TYPE.rock ||
            (entityType === ENTITY_TYPE.enemy && !(other as any)?.isDead)
        ) {
            this.metadata.destroyed = true;
        }
    }

    resolveCollision(otherAABB: AABB): boolean {
        // For projectiles, any wall collision destroys them
        const isColliding = this.aabb.collidingWith(otherAABB);
        if (isColliding) {
            this.metadata.destroyed = true;
        }
        return isColliding;
    }

    render(ctx: CanvasRenderingContext2D, time: number): void {
        // Calculate shadow based on height
        const shadowSize = this.radius * 1.5;
        const shadowOpacity = Math.max(0.1, 0.5 - this.height / 100);

        // Draw shadow on the ground
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 2, shadowSize, shadowSize * 0.6, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Calculate projectile position with height offset
        const renderY = this.y - this.height;

        // Draw circular projectile (tear-like)
        ctx.fillStyle = "#FFD700"; // Gold color for projectile
        ctx.beginPath();
        ctx.arc(this.x, renderY, this.radius, 0, 2 * Math.PI);
        ctx.fill();

        // Add a subtle highlight to make it look more 3D
        ctx.fillStyle = "#FFFF99";
        ctx.beginPath();
        ctx.arc(this.x - 1, renderY - 1, this.radius * 0.4, 0, 2 * Math.PI);
        ctx.fill();
    }
}

export class Player extends Entity {
    renderWidth = 50;

    // TODO player stats
    accel = 3500;
    maxVel: number = 400;

    direction = DOWN;
    playerSpites: { [key: number]: HTMLCanvasElement[] };

    immuneDuration = 0;
    // Shooting cooldown
    shootCooldown = 0;
    shootCooldownTime = 0.4; // 400ms


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

        if (this.shootCooldown > 0) {
            this.shootCooldown -= dt;
        }

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
            angle: this.direction,
            shootCooldown: this.shootCooldown,
        }
    }

    update(game: MazeGame, dt: number): void {
        if (this.immuneDuration > 0) {
            this.immuneDuration -= dt;
        }
    }

    onCollision(other: Entity, game?: any): void {

        if (other.metadata.entityType === ENTITY_TYPE.enemy && this.immuneDuration <= 0) {
            this.applyImpulse(this.pos.sub(other.pos).normalize().muli(500));
            this.immuneDuration = 1;
        }
    }

    onShootInput(direction: number, game: any): void {
        if (direction === -1 || this.shootCooldown > 0) return;

        this.shootCooldown = this.shootCooldownTime;

        const projectilePos = this.pos.clone();

        // Offset projectile a bit
        switch (direction) {
            case LEFT:
                projectilePos.x -= this.width / 2 + 5;
                break;
            case RIGHT:
                projectilePos.x += this.width / 2 + 5;
                break;
            case UP:
                projectilePos.y -= this.height / 2 + 5;
                break;
            case DOWN:
                projectilePos.y += this.height / 2 + 5;
                break;
        }


        const inheritedVelocity = this.vel.mul(0.4);
        const projectile = new ProjectileEntity(projectilePos, direction, inheritedVelocity);
        game.addProjectile(projectile);
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
    sprite: HTMLCanvasElement;

    constructor(pos: Vector2) {
        super(pos, 40, 40);
        this.sprite = ScrollSprite;
        this.metadata = { entityType: ENTITY_TYPE.scroll };
    }

    onCollision(other: Entity, game?: any): void {
        if (other.metadata?.entityType === 'player') {
            this.metadata.destroyed = true;
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
    hurtSprite: HTMLCanvasElement;
    deadSprite: HTMLCanvasElement;

    maxVel: number = 150;
    accel: number = 2000;

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
    hurtDisplayTime: number = 500; // ms to show hurt sprite
    isDead: boolean = false;
    deathTime: number = 0;
    fadeOutDuration: number = 1000; // ms to fade out

    constructor(pos: Vector2, health?: number) {
        super(pos, 25, 25);


        // TODO: Convert to webp
        this.sprite = loadImageToCanvas("/maze/enemy_sprites/enemy_1.webp", 50, false, 0);
        this.hurtSprite = loadImageToCanvas("/maze/enemy_sprites/enemy_1_hurt.png", 50, false, 0);
        this.deadSprite = loadImageToCanvas("/maze/enemy_sprites/enemy_1_dead.png", 50, false, 0);
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

            if (this.health <= 0) {
                this.isDead = true;
                this.deathTime = Date.now();
                // Don't set destroyed immediately - let the fade animation complete
            }
            this.applyImpulse(this.pos.sub(other.pos).normalize().mul(400));
        }
    }

    update(game: MazeGame, dt: number): void {
        // Update hurt state timer
        if (this.isHurt && this.hurtDuration > 0) {
            this.hurtDuration -= dt * 1000; // Convert dt to ms
            if (this.hurtDuration <= 0) {
                this.isHurt = false;
                this.hurtDuration = 0;
            }
        }

        // Handle death animation completion
        if (this.isDead) {
            const timeSinceDeath = Date.now() - this.deathTime;
            if (timeSinceDeath >= this.fadeOutDuration) {
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
                this.move(player.pos.sub(this.pos), dt);
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

        // Choose the appropriate sprite based on state
        let currentSprite = this.sprite;
        if (this.isDead) {
            currentSprite = this.deadSprite;

            // Calculate fade alpha based on time since death
            const timeSinceDeath = Date.now() - this.deathTime;
            const fadeProgress = Math.min(timeSinceDeath / this.fadeOutDuration, 1);
            const alpha = 1 - fadeProgress;
            ctx.globalAlpha = alpha;
        } else if (this.isHurt) {
            currentSprite = this.hurtSprite;
        }

        ctx.drawImage(currentSprite, 0, 0);

        // Reset canvas properties
        ctx.globalAlpha = 1;

        ctx.setTransform(transform);

        // draw hitbox
        ctx.strokeRect(center.x - this.width / 2, center.y - this.height / 2, this.width, this.height)
    }
}