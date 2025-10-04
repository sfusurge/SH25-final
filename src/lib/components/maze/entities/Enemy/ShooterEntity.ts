import { EnemyEntity } from "$lib/components/maze/entities/Enemy/EnemyEntity";
import { loadImageToCanvas, type Entity } from "$lib/components/maze/Entity";
import { ENTITY_TYPE, LEFT, RIGHT, Player, ProjectileEntity } from "$lib/components/maze/entities";
import { CELL_SIZE } from "$lib/components/maze/Maze";
import type { MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";
import type { Vector2 } from "$lib/Vector2";

const SHOOT_RANGE = 3 * CELL_SIZE;
const MIN_FLEE_DISTANCE = 1.5 * CELL_SIZE;

export class ShooterEntity extends EnemyEntity {

    static BASE_STATS = {
        currentHealth: 0.5,
        maxVel: 50,
        damage: 0.5,
        knockback: 550,
        projectileSpeed: 300,
        shootInterval: 2.2
    };

    static SCALING_CONFIG = {
        currentHealthPerLevel: 0.3,
        maxVelPerLevel: 12,
        damagePerLevel: 0.25,
        knockbackPerLevel: 40,
        projectileSpeedPerLevel: 10,
        shootIntervalPerLevel: -0.15
    };

    maxVel: number = 230;
    accel: number = 1800;
    currentHealth: number = 1;

    shootCooldown = 0;
    shootInterval = ShooterEntity.BASE_STATS.shootInterval;
    projectileSpeed = ShooterEntity.BASE_STATS.projectileSpeed;
    damage = ShooterEntity.BASE_STATS.damage;
    knockback = ShooterEntity.BASE_STATS.knockback;
    alwaysAnimate: boolean = true;

    constructor(pos: Vector2, level: number = 1) {
        super(pos, [
            loadImageToCanvas("/maze/enemy_sprites/enemy_3.webp", 50, false, 0),
            loadImageToCanvas("/maze/enemy_sprites/enemy_3_hurt.webp", 50, false, 0),
            loadImageToCanvas("/maze/enemy_sprites/enemy_3_dead.webp", 50, false, 0),
            loadImageToCanvas("/maze/enemy_sprites/enemy_3.webp", 50, true, 0),
            loadImageToCanvas("/maze/enemy_sprites/enemy_3_hurt.webp", 50, true, 0),
            loadImageToCanvas("/maze/enemy_sprites/enemy_3_dead.webp", 50, true, 0),
        ]);

        this.applyScaling(level, ShooterEntity.BASE_STATS, ShooterEntity.SCALING_CONFIG);

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

        // if (distanceToPlayer < MIN_FLEE_DISTANCE) {
        //     this.fleeFromPlayer(player, dt);
        //     return;
        // }

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

        // Round down damage to nearest 0.5 (for slower scaling)
        projectile.damage = Math.floor(this.damage * 2) / 2;
        projectile.distanceBeforeDrop = 160;
        projectile.hitForce = this.knockback;

        game.addProjectile(projectile);
    }
}
