import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { ENTITY_TYPE } from ".";
import { Vector2 } from "$lib/Vector2";
import type { MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";
import { EffectSource, getEffectPool } from "../EffectSystem.svelte";

const ScrollSprite = loadImageToCanvas("/maze/scroll.webp", 40, false, 0);

export class ScrollEntity extends Entity {
    static: boolean = false;
    sprite: HTMLCanvasElement;
    source: EffectSource;
    glowColor: string | null;

    constructor(pos: Vector2) {
        super(pos, 40, 40, 10, 10);
        this.sprite = ScrollSprite;
        this.source = Math.random() < 0.7 ? EffectSource.SCROLL_TIMED : EffectSource.SCROLL_PASSIVE;
        this.glowColor = this.source === EffectSource.SCROLL_PASSIVE ? "#ffcc44" : null;
        this.metadata = { entityType: ENTITY_TYPE.scroll, scrollSource: this.source };
    }

    onCollision(other: Entity, game?: MazeGame): void {
        if (other.metadata?.entityType === ENTITY_TYPE.player) {
            this.toBeDeleted = true;
            game?.effects?.grantRandomEffect(this.source);
        }
    }

    mainRender(ctx: CanvasRenderingContext2D, time: number): void {
        const aabb = this.aabb;
        const center = aabb.center;

        if (this.glowColor) {
            ctx.save();
            ctx.shadowColor = this.glowColor;
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            for (let i = 0; i < 3; i++) {
                ctx.drawImage(this.sprite, center.x - this.sprite.width / 2, center.y - this.sprite.height / 2);
            }

            ctx.restore();
        }

        ctx.drawImage(this.sprite, center.x - this.sprite.width / 2, center.y - this.sprite.height / 2);
    }
}