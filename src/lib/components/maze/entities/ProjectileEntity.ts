import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { ENTITY_TYPE, LEFT, RIGHT, UP, DOWN } from ".";
import { Vector2 } from "$lib/Vector2";
import { AABB } from "$lib/Vector2";
import { debug, type MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";

export class ProjectileEntity extends Entity {
    direction: number | null = null;
    directionVector: Vector2;
    speed: number = 450;
    distanceBeforeDrop: number = 100;
    distanceTraveled: number = 0;
    initialVelocity: Vector2; // Velocity inherited from player
    damage: number = 0.5; // Damage dealt to entities
    hitForce: number = 400;

    height: number = 15; // Height above ground
    verticalVelocity: number = 0;
    gravity: number = 250;
    radius: number = 7;


    constructor(pos: Vector2, direction: number | Vector2, initialVelocity: Vector2 = Vector2.ZERO, owner: (typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE] = ENTITY_TYPE.player) {
        super(pos, 8, 8);
        if (direction instanceof Vector2) {
            const normalized = direction.clone().normalize();
            this.directionVector = normalized.mag() === 0 ? Vector2.UNIT_X.clone() : normalized;
        } else {
            this.direction = direction;
            this.directionVector = ProjectileEntity.directionToVector(direction);
        }
        this.initialVelocity = initialVelocity.clone();

        this.metadata = { entityType: ENTITY_TYPE.projectile, owner };
    }

    private static directionToVector(direction: number): Vector2 {
        switch (direction) {
            case LEFT:
                return new Vector2(-1, 0);
            case RIGHT:
                return new Vector2(1, 0);
            case UP:
                return new Vector2(0, -1);
            case DOWN:
                return new Vector2(0, 1);
            default:
                return Vector2.UNIT_X.clone();
        }
    }

    update(game: MazeGame, dt: number): void {
        const baseMovement = this.directionVector.mul(this.speed * dt);
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

        if (entityType !== this.metadata.owner) {
            if (
                entityType === ENTITY_TYPE.rock ||
                entityType === ENTITY_TYPE.player ||
                (entityType === ENTITY_TYPE.enemy && !(other as any)?.isDead)
            ) {
                this.toBeDeleted = true;
            }
            other.hit(this, this.damage, this.hitForce);
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
        // Calculate projectile position with height offset
        const renderY = this.y - this.height;

        const isEnemyProjectile = this.metadata.owner === ENTITY_TYPE.enemy;
        const fillColor = isEnemyProjectile ? "#7fd6ff" : "#ff7979";
        const highlightColor = isEnemyProjectile ? "#e3f6ff" : "#ffe1e1";

        // Draw circular projectile (tear-like)
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(this.x, renderY, this.radius, 0, 2 * Math.PI);
        ctx.fill();

        // Add a subtle highlight to make it look more 3D
        ctx.fillStyle = highlightColor;
        ctx.beginPath();
        ctx.arc(this.x - 1, renderY - 1, this.radius * 0.4, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Render shadow separately so it appears under other projectiles
    renderShadow(ctx: CanvasRenderingContext2D): void {
        const shadowSize = this.radius * 1.5;
        const shadowOpacity = Math.max(0.1, 0.5 - this.height / 100);

        ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 2, shadowSize, shadowSize * 0.6, 0, 0, 2 * Math.PI);
        ctx.fill();
    }
}