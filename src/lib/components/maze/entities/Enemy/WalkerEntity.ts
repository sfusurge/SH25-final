import { ENTITY_TYPE } from "$lib/components/maze/entities";
import { EnemyEntity } from "$lib/components/maze/entities/Enemy/EnemyEntity";
import type { Entity } from "$lib/components/maze/Entity";
import { CELL_SIZE } from "$lib/components/maze/Maze";
import type { MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";
import { loadImageToCanvas } from "$lib/components/maze/Entity";
import { Vector2 } from "$lib/Vector2";


export class WalkerEntity extends EnemyEntity {
    static readonly BASE_STATS = {
        currentHealth: 1,
        maxVel: 100,
        damage: 1,
        knockback: 550
    };

    static readonly SCALING_CONFIG = {
        currentHealthPerLevel: 0.5,
        maxVelPerLevel: 15,
        damagePerLevel: 0.5,
        knockbackPerLevel: 50
    };

    constructor(pos: Vector2, level: number = 1) {
        super(
            pos,
            [
                loadImageToCanvas("/maze/enemy_sprites/enemy_1.webp", 50, false, 0),
                loadImageToCanvas("/maze/enemy_sprites/enemy_1_hurt.webp", 50, false, 0),
                loadImageToCanvas("/maze/enemy_sprites/enemy_1_dead.webp", 50, false, 0),

                // Left-facing 
                loadImageToCanvas("/maze/enemy_sprites/enemy_1.webp", 50, true, 0),
                loadImageToCanvas("/maze/enemy_sprites/enemy_1_hurt.webp", 50, true, 0),
                loadImageToCanvas("/maze/enemy_sprites/enemy_1_dead.webp", 50, true, 0),
            ]
        );

        this.applyScaling(level, WalkerEntity.BASE_STATS, WalkerEntity.SCALING_CONFIG);

    }

    onCollision(other: Entity, game?: MazeGame): void {
        super.onCollision(other, game);

        if (other.metadata.entityType === ENTITY_TYPE.player) {
            other.hit(this, this.damage, this.knockback);
        }
    }

    update(game: MazeGame, dt: number): void {
        super.update(game, dt);

        if (this.deathTime > 0) {
            return;
        }

        const { staticEntities,
            player,
            row,
            col,
            playerRow,
            playerCol,
            room
        } = this.getGameStates(game);
        const dist = this.distToPlayer(player);
        // console.log(dist, this.hasSightToPlayer(player, staticEntities, row, col, playerRow, playerCol,));

        if (dist < 2 * CELL_SIZE && this.hasSightToPlayer(player, staticEntities, row, col, playerRow, playerCol,)) {
            return this.moveTowardsPlayer(player, dt);
        }

        this.pathFindToPlayer(game, staticEntities, row, col, playerRow, playerCol);
    }
}