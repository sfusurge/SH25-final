import { AABB, Vector2 } from "$lib/Vector2";
import { type MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";



export function loadImageToCanvas(src: string, width: number, flip = false, padding = 0) {
    const img = new Image();
    img.src = src;

    const canvas = document.createElement("canvas");

    img.addEventListener("load", () => {
        canvas.width = width;
        const height = width * (img.height / img.width); // calc height based on aspect ratio
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (flip) {
            ctx?.translate(width, 0);
            ctx?.scale(-1, 1);
        }

        const halfPadding = Math.floor(padding / 2);
        ctx?.drawImage(img, halfPadding, halfPadding, width - padding, height - padding);
    });

    return canvas;
}
export class Entity {
    pos: Vector2;
    vel: Vector2 = Vector2.ZERO;
    effectModifiers: {
        hasShield: boolean;
    } | null = null;

    static localCanvas: HTMLCanvasElement;
    static localCtx: CanvasRenderingContext2D;
    static overlayCanvas: HTMLCanvasElement;
    static overlayCtx: CanvasRenderingContext2D;
    static {
        const _localCanvas = document.createElement("canvas");
        _localCanvas.width = 100;
        _localCanvas.height = 100;
        Entity.localCanvas = _localCanvas;
        Entity.localCtx = _localCanvas.getContext("2d")!;

        const _overlayCanvas = document.createElement("canvas");
        _overlayCanvas.width = 100;
        _overlayCanvas.height = 100;
        Entity.overlayCanvas = _overlayCanvas;
        Entity.overlayCtx = _overlayCanvas.getContext("2d")!;
    }
    useOverlay = false; // entity that use overlay gets it own dedicated canvas to render on instead of the global canvas

    static = false; // static entity don't collide with walls, or other static entities
    solid = false; // solid objects blocks movement of player and path finding agents.

    metadata: { [key: string]: any } = {};

    // assume box shaped
    width: number;
    height: number;

    // movement
    accel: number = 1900;
    maxVel: number = 300;
    maxVelMod = 1;

    // health, immune durations
    hurtRemainTime = 0;
    immuneRemainTime = 0;
    maxHealth = 10;
    currentHealth = 10;
    toBeDeleted = false;
    defaultImmuneDuration = 1;

    get x() {
        return this.pos.x;
    }

    get y() {
        return this.pos.y;
    }

    constructor(pos: Vector2, width: number, height: number) {
        this.width = width;
        this.height = height;

        this.pos = pos;
    }

    get aabb() {
        return new AABB(
            this.pos.subp(this.width / 2, this.height / 2),
            this.pos.addp(this.width / 2, this.height / 2)
        );
    }

    /**
     * Called when this entity collides with another entity
     * @param other The other entity involved in the collision
     * @param game Reference to the game instance for accessing game state
     */
    onCollision(other: Entity, game?: any): void {
        // Default implementation does nothing
    }

    resolveCollision(otherAABB: AABB, otherVel = Vector2.ZERO) {
        const a = this.aabb;
        const isColliding = a.collidingWith(otherAABB);

        if (!isColliding) {
            return;
        }

        // intersection dist of how far A went into B
        let px = 0, py = 0;

        if (a.right > otherAABB.left && a.left < otherAABB.right) {
            // a is intersecting b from left
            px = otherAABB.left - a.right;
        }

        // a intersection from right
        if (a.left < otherAABB.right && a.right > otherAABB.left) {
            const temp = otherAABB.right - a.left;

            if (Math.abs(temp) < Math.abs(px)) {
                px = temp; // pick which small magnitude direction to move
            }
        }

        // a intersect from above
        if (a.bot > otherAABB.top && a.top < otherAABB.bot) {
            py = otherAABB.top - a.bot;
        }

        // a intersect from below
        if (a.top < otherAABB.bot && a.bot > otherAABB.top) {
            const temp = otherAABB.bot - a.top;
            if (Math.abs(temp) < Math.abs(py)) {
                py = temp;
            }
        }


        if (Math.abs(px) < Math.abs(py)) {
            this.vel.x *= 0.5;
            this.pos.x += px * 1.01;
        } else {
            this.vel.y *= 0.5;
            this.pos.y += py * 1.01;
        }
    }

    /**
     * maybe do some physics, just modify velocity directly for now.
     */
    applyImpulse(dv: Vector2) {
        this.vel.addi(dv);
    }

    hit(other: Entity, dmg: number, hitForce = 800) {
        if (this.immuneRemainTime > 0) {
            return;
        }

        if (this.effectModifiers?.hasShield) {
            return;
        }

        this.currentHealth = Math.max(this.currentHealth - dmg, 0);
        if (this.currentHealth > 0) {
            this.applyImpulse(this.pos.sub(other.pos).normalize().muli(hitForce));
        } else {
            this.vel = this.pos.sub(other.pos).normalize().muli(hitForce);
        }

        this.immuneRemainTime = this.defaultImmuneDuration;
        this.hurtRemainTime = Math.max(this.defaultImmuneDuration / 4, 0.2);
    }

    /**
     * do state updates here, please call super :P
     */
    update(game: MazeGame, dt: number) {
        if (this.hurtRemainTime > 0) {
            this.hurtRemainTime = Math.max(this.hurtRemainTime - dt, 0);
        }

        if (this.immuneRemainTime) {
            this.immuneRemainTime = Math.max(this.immuneRemainTime - dt, 0);
        }
    }

    /**
     * tries to accelerate
     * @param desiredDirection
     */
    move(desiredDirection: Vector2, dt: number) {
        desiredDirection = desiredDirection.normalized();

        const diff = desiredDirection.mul(this.maxVel * this.maxVelMod).subi(this.vel); // missing velocity (unit/s) to reach target velocity
        const diffMag = diff.mag();

        // add velocity towards target vel, using either the different or acceleration
        // which ever is lower.
        if (diffMag < this.accel * dt) {
            this.vel.addi(diff);
        } else {
            this.vel.addi(diff.normalized().muli(this.accel * dt));
        }

        this.pos.addi(this.vel.mul(dt));
    }

    moveByVel(dt: number) {
        this.pos.addi(this.vel.mul(dt));
    }


    render(ctx: CanvasRenderingContext2D, time: number) {

        if (this.useOverlay) {
            // reset local overlay canvas
            Entity.localCtx.resetTransform();
            Entity.localCtx.clearRect(0, 0, 100, 100);
            Entity.localCtx.translate(50, 50);
            Entity.localCtx.globalCompositeOperation = "source-over";

            this.mainRender(Entity.localCtx, time);

            // apply colored filters here
            if (this.hurtRemainTime > 0) {
                this.applyOverlay("ff5050");
            }


            this.postRender(Entity.localCtx, time);

            ctx.drawImage(Entity.localCanvas, this.x - 50, this.y - 50);
        }
        else {
            this.mainRender(ctx, time);
            this.postRender(ctx, time);
        }
    }


    /**
     * render() assumed ctx is already transformed to the correct location,
     * accounting for camera position, zoom, and entity locatiom
     * This renders visuals in local coordinates.
     * @param ctx
     * @param time current time in game, modulus may be applied. Used for animations
     *
     */
    mainRender(ctx: CanvasRenderingContext2D, time: number) {
        throw new Error('not implemented');
    }


    postRender(ctx: CanvasRenderingContext2D, time: number) {

    }

    applyOverlay(color: string) {
        const ctx = Entity.localCtx;
        // only render where there is already pixel, ie, overlaying
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = `#${color}55`
        ctx.fillRect(-50, -50, 100, 100);
    }

}