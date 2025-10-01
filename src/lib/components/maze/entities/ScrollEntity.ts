import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { ENTITY_TYPE } from ".";
import { Vector2 } from "$lib/Vector2";
import type { MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";
import { EffectSource } from "../EffectSystem.svelte";

const ScrollSprite = loadImageToCanvas("/maze/scroll.webp", 40, false, 0);

export class ScrollEntity extends Entity {
    static: boolean = false;
    sprite: HTMLCanvasElement;

    constructor(pos: Vector2) {
        super(pos, 40, 40);
        this.sprite = ScrollSprite;
        this.metadata = { entityType: ENTITY_TYPE.scroll };
    }

    onCollision(other: Entity, game?: MazeGame): void {
        if (other.metadata?.entityType === ENTITY_TYPE.player) {
            this.toBeDeleted = true;
            game?.effects?.grantRandomEffect(EffectSource.SCROLL);
        }
    }

    mainRender(ctx: CanvasRenderingContext2D, time: number): void {
        const aabb = this.aabb;
        const center = aabb.center
        ctx.drawImage(this.sprite, center.x - this.sprite.width / 2, center.y - this.sprite.height / 2);
    }
}