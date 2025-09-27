import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { ENTITY_TYPE } from ".";
import { Vector2 } from "$lib/Vector2";

const TrapSprite = loadImageToCanvas("/maze/trap.webp", 50, false, 0);

export class TrapEntity extends Entity {
    static = true;
    sprite: HTMLCanvasElement;

    constructor(pos: Vector2) {
        super(pos, 40, 40);
        this.sprite = TrapSprite;
        this.metadata = { entityType: ENTITY_TYPE.trap };
    }

    onCollision(other: Entity, game?: any): void {
        if (other.metadata?.entityType === 'player') {
            // TODO
        }
    }

    render(ctx: CanvasRenderingContext2D, time: number): void {
        const aabb = this.aabb;
        ctx.drawImage(this.sprite, aabb.x, aabb.y);
    }
}