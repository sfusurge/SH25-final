import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { ENTITY_TYPE, LEFT, RIGHT, UP, DOWN } from ".";
import { Vector2 } from "$lib/Vector2";
import { AABB } from "$lib/Vector2";
import { debug, type MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";

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


    constructor(pos: Vector2, direction: number, initialVelocity: Vector2 = Vector2.ZERO, owner: (typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE] = ENTITY_TYPE.player) {
        super(pos, 8, 8);
        this.direction = direction;
        this.initialVelocity = initialVelocity.clone();

        this.metadata = { entityType: ENTITY_TYPE.projectile, owner };
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
            this.toBeDeleted = true;
        }
    }

    onCollision(other: Entity, game?: MazeGame): void {
        const entityType = other.metadata?.entityType;

        // Destroy projectile on collision with solid objects
        if (
            entityType === ENTITY_TYPE.rock ||
            (entityType === ENTITY_TYPE.enemy && !(other as any)?.isDead)
        ) {
            this.toBeDeleted = true;
        }
        if (entityType !== this.metadata.owner) {
            other.hit(this, 0.5, 400);
        }
    }

    resolveCollision(otherAABB: AABB): boolean {
        // For projectiles, any wall collision destroys them
        const isColliding = this.aabb.collidingWith(otherAABB);
        if (isColliding) {
            this.toBeDeleted = true;
        }
        return isColliding;
    }

    mainRender(ctx: CanvasRenderingContext2D, time: number): void {
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