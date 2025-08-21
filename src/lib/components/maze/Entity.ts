import { AABB, Vector2 } from "$lib/Vector2";


export class Entity {
    pos: Vector2;
    vel: Vector2 = Vector2.ZERO;

    // assume box shaped
    width: number;
    height: number;

    metadata: string = "";

    accel: number = 1900;
    maxVel: number = 300;
    maxVelMod  = 1;

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
     * tries to accelerate
     * @param desiredDirection
     */
    move(desiredDirection: Vector2, dt: number) {
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


    /**
     * render() assumed ctx is already transformed to the correct location,
     * accounting for camera position, zoom, and entity locatiom
     * This renders visuals in local coordinates.
     * @param ctx
     */
    render(ctx: CanvasRenderingContext2D) {
        throw new Error('not implemented');
    }
}