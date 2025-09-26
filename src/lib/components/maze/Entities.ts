import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { Vector2 } from "$lib/Vector2";
import { AABB } from "$lib/Vector2";
import { debug, type MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";
import { AStar, lineOfSight } from "$lib/components/maze/PathFind";
import { CELL_SIZE } from "$lib/components/maze/Maze";
import type { RoomLayout } from "$lib/components/maze/Room";
import { GameState } from "$lib/components/maze/MazeGameState.svelte";

export const ENTITY_TYPE = Object.freeze({
    player: -1,
    empty: 0,
    rock: 1,
    trap: 2,
    scroll: 3,
    enemy: 4,
    projectile: 5,
    door: 6,
});

const LEFT = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;



export class ProjectileEntity extends Entity {
    direction: number;
    speed: number = 450;
    distanceBeforeDrop: number = 200;
    distanceTraveled: number = 0;
    initialVelocity: Vector2; // Velocity inherited from player

    height: number = 15; // Height above ground
    verticalVelocity: number = 0;
    gravity: number = 250;
    radius: number = 7;

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
    playerHurtSprites: { [key: number]: HTMLCanvasElement[] };

    immuneDuration = 0;
    // Shooting cooldown
    shootCooldown = 0;
    shootCooldownTime = 0.4; // seconds

    isHurt = false;
    hurtDuration = 0;
    hurtDisplayTime = 0.5; // seconds


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

        // Load hurt sprites (red-tinted versions)
        this.playerHurtSprites = {
            [LEFT]: [
                loadImageToCanvas("/maze/player_sprites/player_left_neutral_hurt.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_left_walk_1_hurt.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_left_walk_2_hurt.webp", this.renderWidth),
            ],
            [RIGHT]: [
                loadImageToCanvas("/maze/player_sprites/player_left_neutral_hurt.webp", this.renderWidth, true),
                loadImageToCanvas("/maze/player_sprites/player_left_walk_1_hurt.webp", this.renderWidth, true),
                loadImageToCanvas("/maze/player_sprites/player_left_walk_2_hurt.webp", this.renderWidth, true),
            ],
            [UP]: [
                loadImageToCanvas("/maze/player_sprites/player_up_neutral_hurt.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_up_walk_1_hurt.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_up_walk_2_hurt.webp", this.renderWidth),
            ],
            [DOWN]: [
                loadImageToCanvas("/maze/player_sprites/player_down_neutral_hurt.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_down_walk_1_hurt.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_down_walk_2_hurt.webp", this.renderWidth),
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

        // Update hurt state timer
        if (this.isHurt && this.hurtDuration > 0) {
            this.hurtDuration -= dt;
            if (this.hurtDuration <= 0) {
                this.isHurt = false;
                this.hurtDuration = 0;
            }
        }
    }

    onCollision(other: Entity, game?: any): void {

        if (other.metadata.entityType === ENTITY_TYPE.enemy && this.immuneDuration <= 0) {
            if ((other as any).isDead) {
                return;
            }
            this.applyImpulse(this.pos.sub(other.pos).normalize().muli(800));
            this.immuneDuration = 1;

            this.isHurt = true;
            this.hurtDuration = this.hurtDisplayTime;

            GameState.reduceHealth(10);
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


        const inheritedVelocity = this.vel.mul(0.3);
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
        this.renderWithDamageState(ctx, sprite, this.x, this.y, this.isHurt);

        ctx.setTransform(trans);
    }
}

const RockSprite = loadImageToCanvas("/maze/rock.webp", 40, false, 0);
const ScrollSprite = loadImageToCanvas("/maze/scroll.webp", 40, false, 0);
const TrapSprite = loadImageToCanvas("/maze/trap.webp", 50, false, 0);
const LockedDoorSprite = loadImageToCanvas("/maze/door_locked.webp", 40, false, 0);
const OpenDoorSprite = loadImageToCanvas("/maze/door_open.webp", 40, false, 0);

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
    static: boolean = true;
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

export class DoorEntity extends Entity {
    static: boolean = true;
    sprite: HTMLCanvasElement;
    openSprite: HTMLCanvasElement;
    lockedSprite: HTMLCanvasElement;
    isLocked: boolean = true;

    constructor(pos: Vector2) {
        super(pos, 40, 40);
        this.sprite = LockedDoorSprite;
        this.openSprite = OpenDoorSprite;
        this.lockedSprite = LockedDoorSprite;
        this.metadata.entityType = ENTITY_TYPE.door;
    }

    onCollision(other: Entity, game?: MazeGame): void {
        if (other.metadata?.entityType === ENTITY_TYPE.player && !this.isLocked) {
            game?.beginDoorEntry?.(this);
        }
    }

    render(ctx: CanvasRenderingContext2D, time: number): void {
        const aabb = this.aabb;
        const center = aabb.center;
        
        // Add glow effect
        ctx.save();
        ctx.shadowColor = this.isLocked ? '#ff6666' : '#aacc77';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        for (let i = 0; i < 3; i++) {
            if (this.isLocked) {
                ctx.drawImage(this.lockedSprite, center.x - this.lockedSprite.width / 2, center.y - this.lockedSprite.height / 2);
            } else {
                ctx.drawImage(this.openSprite, center.x - this.openSprite.width / 2, center.y - this.openSprite.height / 2);
            }
        }
        
        ctx.restore();
        
        if (this.isLocked) {
            ctx.drawImage(this.lockedSprite, center.x - this.lockedSprite.width / 2, center.y - this.lockedSprite.height / 2);
        } else {
            ctx.drawImage(this.openSprite, center.x - this.openSprite.width / 2, center.y - this.openSprite.height / 2);
        }
    }
}