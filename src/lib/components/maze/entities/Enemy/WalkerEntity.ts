import { ENTITY_TYPE } from "$lib/components/maze/entities";
import { EnemyEntity } from "$lib/components/maze/entities/Enemy/EnemyEntity";
import type { Entity } from "$lib/components/maze/Entity";
import { CELL_SIZE } from "$lib/components/maze/Maze";
import type { MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";
import { loadImageToCanvas } from "$lib/components/maze/Entity";
import { Vector2 } from "$lib/Vector2";


export class WalkerEntity extends EnemyEntity {
    maxVel: number = 125;
    currentHealth: number = 2;

    constructor(pos: Vector2) {
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
    }

    onCollision(other: Entity, game?: MazeGame): void {
        super.onCollision(other, game);

        if (other.metadata.entityType === ENTITY_TYPE.player) {
            other.hit(this, 1, 550);
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