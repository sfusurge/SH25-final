import { ENTITY_TYPE } from "$lib/components/maze/entities";
import { EnemyEntity } from "$lib/components/maze/entities/Enemy/EnemyEntity";
import type { Entity } from "$lib/components/maze/Entity";
import { CELL_SIZE } from "$lib/components/maze/Maze";
import type { MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";


export class WalkerEntity extends EnemyEntity {
    maxVel: number = 125;
    currentHealth: number = 2;

    onCollision(other: Entity, game?: MazeGame): void {
        super.onCollision(other, game);

        if (other.metadata.entityType === ENTITY_TYPE.player) {
            other.hit(this, 0.5, 550);
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