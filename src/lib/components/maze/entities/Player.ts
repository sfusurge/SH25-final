import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { ENTITY_TYPE, LEFT, RIGHT, UP, DOWN } from ".";
import { Vector2 } from "$lib/Vector2";
import { ProjectileEntity } from "./ProjectileEntity";
import { debug, type MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";

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


    useOverlay: boolean = true;
    effectModifiers = {
        moveSpeedMultiplier: 1,
        shootCooldownMultiplier: 1,
        damageMultiplier: 1,
        projectileRangeMultiplier: 1,
        hasShield: false,
        multiShotCount: 1, // Number of projectiles to shoot 
    };

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

        this.maxVelMod = this.effectModifiers.moveSpeedMultiplier;

        this.move(movement, dt);

        debug.player = {
            vel: this.vel,
            move: movement,
            angle: this.direction,
            shootCooldown: this.shootCooldown,
        }
    }

    update(game: MazeGame, dt: number): void {
        super.update(game, dt);
    }

    onCollision(other: Entity, game?: any): void {

    }

    onShootInput(direction: number, game: any): void {
        if (direction === -1 || this.shootCooldown > 0) return;

        this.shootCooldown = this.shootCooldownTime * this.effectModifiers.shootCooldownMultiplier;

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
        projectile.damage *= this.effectModifiers.damageMultiplier;
        projectile.distanceBeforeDrop *= this.effectModifiers.projectileRangeMultiplier;

        game.addProjectile(projectile);

        // Multi-shot effect 
        const extraShots = this.effectModifiers.multiShotCount - 1;
        if (extraShots > 0) {
            const isHorizontal = direction === LEFT || direction === RIGHT;
            const spacing = 15;

            for (let i = 1; i <= extraShots; i++) {
                const secondPos = projectilePos.clone();

                // Alternate sides evenly: odd indices go positive, even go negative
                const side = i % 2 === 1 ? 1 : -1;
                const offsetIndex = Math.ceil(i / 2); // 1,1,2,2,3,3...
                const actualOffset = offsetIndex * spacing * side;

                if (isHorizontal) {
                    secondPos.y += actualOffset;
                } else {
                    secondPos.x += actualOffset;
                }

                const extraProjectile = new ProjectileEntity(secondPos, direction, inheritedVelocity);
                extraProjectile.damage *= this.effectModifiers.damageMultiplier;
                extraProjectile.distanceBeforeDrop *= this.effectModifiers.projectileRangeMultiplier;
                game.addProjectile(extraProjectile);
            }
        }
    }


    mainRender(ctx: CanvasRenderingContext2D, time: number): void {
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
        ctx.drawImage(sprite, 0, 0);

        ctx.setTransform(trans);
    }

    restoreHealth(amount: number): void {
        this.currentHealth += amount;
        this.currentHealth = Math.min(this.currentHealth, this.maxHealth);
    }

    takeDamage(amount: number): void {
        this.currentHealth -= amount;
        this.currentHealth = Math.max(this.currentHealth, 0);
    }
}