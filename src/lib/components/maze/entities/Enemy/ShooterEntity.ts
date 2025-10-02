import { EnemyEntity } from "$lib/components/maze/entities/Enemy/EnemyEntity";
import { loadImageToCanvas, type Entity } from "$lib/components/maze/Entity";
import { ENTITY_TYPE, LEFT, RIGHT, Player, ProjectileEntity } from "$lib/components/maze/entities";
import { CELL_SIZE } from "$lib/components/maze/Maze";
import type { MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";
import type { Vector2 } from "$lib/Vector2";

const SHOOT_RANGE = 6 * CELL_SIZE;
const MIN_FLEE_DISTANCE = 1.5 * CELL_SIZE;

export class ShooterEntity extends EnemyEntity {
    maxVel: number = 100;
    accel: number = 1800;
    currentHealth: number = 1;

    shootCooldown = 0;
    shootInterval = 2;
    projectileSpeed = 320;
    projectileDamage = 0.5;
    projectileKnockback = 550;
    alwaysAnimate: boolean = true;

    constructor(pos: Vector2) {
        super(pos, [
            loadImageToCanvas("/maze/enemy_sprites/enemy_3.webp", 50, false, 0),
            loadImageToCanvas("/maze/enemy_sprites/enemy_3_hurt.webp", 50, false, 0),
            loadImageToCanvas("/maze/enemy_sprites/enemy_3_dead.webp", 50, false, 0),
            loadImageToCanvas("/maze/enemy_sprites/enemy_3.webp", 50, true, 0),
            loadImageToCanvas("/maze/enemy_sprites/enemy_3_hurt.webp", 50, true, 0),
            loadImageToCanvas("/maze/enemy_sprites/enemy_3_dead.webp", 50, true, 0),
        ]);

    }

    update(game: MazeGame, dt: number): void {
        super.update(game, dt);

        if (this.deathTime > 0) {
            return;
        }

        this.shootCooldown = Math.max(0, this.shootCooldown - dt);

        const { staticEntities, player, row, col, playerRow, playerCol } = this.getGameStates(game);
        const distanceToPlayer = this.distToPlayer(player);
        const hasSight = this.hasSightToPlayer(player, staticEntities, row, col, playerRow, playerCol);

        if (distanceToPlayer < MIN_FLEE_DISTANCE) {
            this.fleeFromPlayer(player, dt);
            return;
        }

        if (hasSight && distanceToPlayer <= SHOOT_RANGE) {
            this.facePlayer(player);
            if (this.shootCooldown === 0) {
                this.fireProjectileAtPlayer(game, player);
                this.shootCooldown = this.shootInterval;
            }
            return;
        }

        this.pathFindToPlayer(game, staticEntities, row, col, playerRow, playerCol);
    }

    private facePlayer(player: Player) {
        const toPlayer = player.pos.sub(this.pos);
        this.facingDirection = toPlayer.x >= 0 ? RIGHT : LEFT;
    }

    // maintain distance from player
    private fleeFromPlayer(player: Player, dt: number) {
        const direction = this.pos.sub(player.pos);
        if (direction.mag() < 0.01) {
            return;
        }
        this.move(direction, dt);
    }

    private fireProjectileAtPlayer(game: MazeGame, player: Player) {
        const toPlayer = player.pos.sub(this.pos);
        if (toPlayer.mag() === 0) {
            return;
        }

        const shootDirection = toPlayer.normalized();
        const spawnOffset = shootDirection.mul(this.width / 2 + 6);
        const projectilePos = this.pos.add(spawnOffset);

        const projectile = new ProjectileEntity(projectilePos, shootDirection, this.vel.mul(0.25), ENTITY_TYPE.enemy);
        projectile.speed = this.projectileSpeed;
        projectile.damage = this.projectileDamage;
        projectile.distanceBeforeDrop = 160;
        projectile.hitForce = this.projectileKnockback;

        game.addProjectile(projectile);
    }
}
