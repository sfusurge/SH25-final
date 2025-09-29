import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { ENTITY_TYPE, LEFT, RIGHT, UP, DOWN } from ".";
import { Vector2 } from "$lib/Vector2";
import { ProjectileEntity } from "./ProjectileEntity";
import { debug, type MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";
import { GameState } from "$lib/components/maze/MazeGameState.svelte";

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