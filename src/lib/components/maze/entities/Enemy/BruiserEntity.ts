import { ENTITY_TYPE } from "$lib/components/maze/entities";
import { EnemyEntity } from "$lib/components/maze/entities/Enemy/EnemyEntity";
import { loadImageToCanvas, type Entity } from "$lib/components/maze/Entity";
import { CELL_SIZE } from "$lib/components/maze/Maze";

import type { MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";
import type { Vector2 } from "$lib/Vector2";


export class BruiserEntity extends EnemyEntity {
    maxVel: number = 75;
    currentHealth: number = 3;


    constructor(pos: Vector2) {
        super(
            pos,
            [
                loadImageToCanvas("/maze/enemy_sprites/enemy_2.webp", 50, false, 0),
                loadImageToCanvas("/maze/enemy_sprites/enemy_2_hurt.webp", 50, false, 0),
                loadImageToCanvas("/maze/enemy_sprites/enemy_2_dead.webp", 50, false, 0),

                // Left-facing 
                loadImageToCanvas("/maze/enemy_sprites/enemy_2.webp", 50, true, 0),
                loadImageToCanvas("/maze/enemy_sprites/enemy_2_hurt.webp", 50, true, 0),
                loadImageToCanvas("/maze/enemy_sprites/enemy_2_dead.webp", 50, true, 0),
            ]
        );
    }
    onCollision(other: Entity, game?: MazeGame): void {
        super.onCollision(other, game);

        if (other.metadata.entityType === ENTITY_TYPE.player) {
            other.hit(this, 2, 800);
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