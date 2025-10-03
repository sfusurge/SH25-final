import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { ENTITY_TYPE, LEFT, RIGHT, UP, DOWN, Player } from "..";
import { Vector2 } from "$lib/Vector2";
import { debug, type MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";
import { AStar, lineOfSight } from "$lib/components/maze/PathFind";
import { CELL_SIZE, HALF_CELL } from "$lib/components/maze/Maze";
import { scaleEnemyStats } from "../../EnemyScaling";

type StatRecord = Record<string, number>;

export class EnemyEntity extends Entity {
    static: boolean = false;

    sprite: HTMLCanvasElement;
    hurtSprite: HTMLCanvasElement;
    deadSprite: HTMLCanvasElement;

    spriteLeft: HTMLCanvasElement;
    hurtSpriteLeft: HTMLCanvasElement;
    deadSpriteLeft: HTMLCanvasElement;

    maxVel: number = 100;
    accel: number = 2000;
    alwaysAnimate: boolean = false;

    // Facing direction (LEFT = 0, RIGHT = 2 to match player consts)
    facingDirection: number = RIGHT;

    currentHealth: number = 3;
    deathTime: number = -1;
    fadeOutDuration: number = 0.5; // seconds to fade out

    defaultImmuneDuration: number = 0;
    useOverlay: boolean = true;

    damage: number = 1;
    knockback: number = 550;

    constructor(pos: Vector2, spriteArray: HTMLCanvasElement[]) {
        super(pos, 25, 25);

        // Right-facing 
        this.sprite = spriteArray[0];
        this.hurtSprite = spriteArray[1];
        this.deadSprite = spriteArray[2];

        // Left-facing 
        this.spriteLeft = spriteArray[3];
        this.hurtSpriteLeft = spriteArray[4];
        this.deadSpriteLeft = spriteArray[5];

        this.metadata.entityType = ENTITY_TYPE.enemy;
    }

    applyScaling(level: number, baseStats: StatRecord, scalingConfig: StatRecord = {}) {
        const scaled = scaleEnemyStats(baseStats, level, scalingConfig);

        // Automatically apply any stat that exists as a property on this instance
        for (const [propertyName, scaledValue] of Object.entries(scaled)) {
            if (propertyName in this) {
                (this as any)[propertyName] = scaledValue;
            }
        }

        return scaled;
    }

    scaleEnemyStats(
        baseStats: StatRecord,
        level: number,
        scalingConfig: StatRecord = {}
    )  {
    
        const levelModifier = level - 1;
        const scaled: StatRecord = {};

        for (const propertyName in baseStats) {
            const baseValue = baseStats[propertyName];
    
            const scalingKey = `${propertyName}PerLevel`;
            const scalingAmount = scalingConfig[scalingKey] ?? 0;
    
            const scaledValue = baseValue + (scalingAmount * levelModifier);
            scaled[propertyName] = scaledValue;
        }
    
        return scaled;
    }
    

    onCollision(other: Entity, game?: any): void {
        // Dead entities don't participate in any collisions
        if (this.toBeDeleted || this.deathTime > 0) {
            return;
        }

        if (other.metadata.entityType === ENTITY_TYPE.player || other.metadata.entityType === ENTITY_TYPE.enemy) {
            this.resolveCollision(other.aabb, other.vel);
        }
    }

    getGameStates(game: MazeGame) {
        const player = game.player;
        const room = game.idToRoomLayout[game.currentRoomId];
        const staticEntities = room.staticEntities;
        const halfCell = CELL_SIZE / 2;

        const row = (Math.floor(this.y / halfCell) - (room.top * 2));
        const col = (Math.floor(this.x / halfCell) - (room.left * 2));
        const playerRow = (Math.floor(player.y / halfCell) - (room.top * 2));
        const playerCol = (Math.floor(player.x / halfCell) - (room.left * 2));

        return {
            player, room,
            staticEntities,
            row,
            col,
            playerRow,
            playerCol
        }
    }

    isLegalPosition(staticEntities: (Entity | undefined)[][], row: number, col: number, playerRow: number, playerCol: number) {
        return staticEntities && staticEntities.length > 0 &&
            row >= 0 && row < staticEntities.length &&
            col >= 0 && col < staticEntities[0].length &&
            playerRow >= 0 && playerRow < staticEntities.length &&
            playerCol >= 0 && playerCol < staticEntities[0].length;
    }

    moveTowardsPlayer(player: Player, dt: number) {
        const moveVector = player.pos.sub(this.pos);
        this.facingDirection = moveVector.x > 0 ? RIGHT : LEFT;
        this.move(moveVector, dt);
    }

    distToPlayer(player: Player) {
        return player.pos.distTo(this.pos);
    }

    hasSightToPlayer(player: Player, staticEntities: (Entity | undefined)[][], row: number, col: number, playerRow: number, playerCol: number) {

        if (!this.isLegalPosition(staticEntities, row, col, playerRow, playerCol)) {
            return false;
        }

        const LOS = lineOfSight(col, row, playerCol, playerRow);

        // check if this ent has clear los
        for (const los of LOS) {
            // Add bounds checking to prevent accessing undefined array elements
            if (staticEntities[los.y][los.x]?.solid) {
                return false
            }
        }


        return true;
    }

    pathFindToPlayer(game: MazeGame, staticEntities: (Entity | undefined)[][], row: number, col: number, playerRow: number, playerCol: number) {
        // Only calculate pathfinding if both entities are within room bounds
        if (!this.isLegalPosition(staticEntities, row, col, playerRow, playerCol)) {
            return;
        }

        const room = game.idToRoomLayout[game.currentRoomId];
        let target: { x: number, y: number } | undefined;

        const pathFinds = AStar(staticEntities, col, row, playerCol, playerRow);

        if (pathFinds && pathFinds.length > 0) {

            target = {
                x: pathFinds.at(-1)!.x * HALF_CELL + room.left * CELL_SIZE + HALF_CELL / 2,
                y: HALF_CELL * pathFinds.at(-1)!.y + room.top * CELL_SIZE + HALF_CELL / 2
            }
        }

        if (target) {
            // const targetPos = Vector2.of(
            //     HALF_CELL * target.x + room.left * CELL_SIZE + HALF_CELL / 2,
            //     HALF_CELL * target.y + room.top * CELL_SIZE + HALF_CELL / 2
            // );
            const moveVector = Vector2.of(target.x, target.y).sub(this.pos);
            this.facingDirection = moveVector.x > 0 ? RIGHT : LEFT;
            this.move(moveVector, game.deltaTime);
        }
    }


    update(game: MazeGame, dt: number): void {
        super.update(game, dt);

        // Handle death animation completion
        if (this.deathTime > 0) {
            this.deathTime = Math.max(0, this.deathTime - dt);

            if (this.deathTime == 0) {
                this.toBeDeleted = true;
            }
            this.move(this.vel, dt);
            return;
        }

        if (this.currentHealth <= 0) {
            this.deathTime = this.fadeOutDuration;
        }

        if (game.currentRoomId === 0) {
            return;
        }

    }

    mainRender(ctx: CanvasRenderingContext2D, time: number): void {
        const mag = this.vel.mag();

        let verOffset = 0;
        let angleOffset = 0;

        // bounce animation
        if (mag > 0.5 || this.alwaysAnimate) {
            const period = ((time % 1000) / 1000) * Math.PI * 2;
            verOffset = Math.abs(Math.sin(period) * 10); // 15px bounce
            angleOffset = Math.cos(period) * Math.PI / 30;
        }

        // draw path finding dot
        const transform = ctx.getTransform();

        ctx.translate(0, verOffset + this.height / 2);
        ctx.rotate(angleOffset);
        ctx.translate(-this.sprite.width / 2, -this.sprite.height);

        let currentSprite;
        if (this.deathTime > 0) {
            currentSprite = this.facingDirection === LEFT ? this.deadSpriteLeft : this.deadSprite;

            // Calculate fade alpha based on time since death
            ctx.globalAlpha = this.deathTime / this.fadeOutDuration;
        } else if (this.hurtRemainTime > 0) {
            currentSprite = this.facingDirection === LEFT ? this.hurtSpriteLeft : this.hurtSprite;
        } else {
            currentSprite = this.facingDirection === LEFT ? this.spriteLeft : this.sprite;
        }

        ctx.drawImage(currentSprite, 0, 0);

        // Reset canvas properties
        ctx.globalAlpha = 1;

        ctx.setTransform(transform);
    }
}
