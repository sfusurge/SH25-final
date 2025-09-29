import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { ENTITY_TYPE } from ".";
import { Vector2 } from "$lib/Vector2";

const ScrollSprite = loadImageToCanvas("/maze/scroll.webp", 40, false, 0);

export class ScrollEntity extends Entity {
    static: boolean = true;
    sprite: HTMLCanvasElement;

    constructor(pos: Vector2) {
        super(pos, 40, 40);
        this.sprite = ScrollSprite;
        this.metadata = { entityType: ENTITY_TYPE.scroll };
    }

    onCollision(other: Entity, game?: any): void {
        if (other.metadata?.entityType === 'player') {
            this.metadata.destroyed = true;
            // TODO
        }
    }

    render(ctx: CanvasRenderingContext2D, time: number): void {
        const aabb = this.aabb;
        const center = aabb.center
        ctx.drawImage(this.sprite, center.x - this.sprite.width / 2, center.y - this.sprite.height / 2);
        ctx.strokeStyle = "red";
        ctx.strokeRect(center.x - this.sprite.width / 2, center.y - this.sprite.height / 2, this.sprite.width, this.sprite.height);

        ctx.strokeStyle = "green";
        ctx.strokeRect(center.x - this.width / 2, center.y - this.height / 2, this.width, this.height);
    }
}