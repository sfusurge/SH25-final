import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { ENTITY_TYPE } from ".";
import { Vector2 } from "$lib/Vector2";
import type { MazeGame } from "../MazeGameRenderer.svelte";
import { EffectSource } from "../EffectSystem.svelte";

const TrapSprite = loadImageToCanvas("/maze/trap.webp", 50, false, 0);

export class TrapEntity extends Entity {
    static = false;
    sprite: HTMLCanvasElement;

    constructor(pos: Vector2) {
        super(pos, 40, 40);
        this.sprite = TrapSprite;
        this.metadata = { entityType: ENTITY_TYPE.trap };
    }

    onCollision(other: Entity, game?: MazeGame): void {
        if (other.metadata?.entityType === ENTITY_TYPE.player) {
            this.toBeDeleted = true;
            game?.effects?.grantRandomEffect(EffectSource.TRAP);
        }
    }

    mainRender(ctx: CanvasRenderingContext2D, time: number): void {
        const aabb = this.aabb;
        ctx.drawImage(this.sprite, aabb.x, aabb.y);
    }
}