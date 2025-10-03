import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { ENTITY_TYPE } from ".";
import { Vector2 } from "$lib/Vector2";
import { debug, type MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";



const RockSprite = loadImageToCanvas("/maze/rock.webp", 50, false, 0);

export class BlockerEntity extends Entity {
    solid = true;
    static = true;
    sprite: HTMLCanvasElement;

    constructor(pos: Vector2, sprite: HTMLCanvasElement) {
        super(pos, 40, 40);
        this.sprite = RockSprite;
        this.metadata = { entityType: ENTITY_TYPE.rock };
    }

    onCollision(other: Entity, game?: MazeGame): void {
        // TODO: optimize?

        if (!other.static) {
            other.resolveCollision(this.aabb);
        }
    }

    // static, no updates

    mainRender(ctx: CanvasRenderingContext2D, time: number): void {
        // TODO
        const aabb = this.aabb;
        const center = aabb.center;
        ctx.drawImage(this.sprite, center.x - this.sprite.width / 2, center.y - this.sprite.height / 2);
        // ctx.strokeStyle = "green";
        // ctx.strokeRect(center.x - this.width / 2, center.y - this.height / 2, this.width, this.height);
    }
}