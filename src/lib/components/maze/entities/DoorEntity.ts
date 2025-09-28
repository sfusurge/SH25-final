import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { ENTITY_TYPE } from ".";
import { Vector2 } from "$lib/Vector2";
import { debug, type MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";

const LockedDoorSprite = loadImageToCanvas("/maze/door_locked.webp", 40, false, 0);
const OpenDoorSprite = loadImageToCanvas("/maze/door_open.webp", 40, false, 0);


export class DoorEntity extends Entity {
    static: boolean = true;
    sprite: HTMLCanvasElement;
    openSprite: HTMLCanvasElement;
    lockedSprite: HTMLCanvasElement;
    isLocked: boolean = true;

    constructor(pos: Vector2) {
        super(pos, 40, 40);
        this.sprite = LockedDoorSprite;
        this.openSprite = OpenDoorSprite;
        this.lockedSprite = LockedDoorSprite;
        this.metadata.entityType = ENTITY_TYPE.door;
    }

    onCollision(other: Entity, game?: MazeGame): void {
        if (other.metadata?.entityType === ENTITY_TYPE.player && !this.isLocked) {
            game?.beginDoorEntry?.(this);
        }
    }

    mainRender(ctx: CanvasRenderingContext2D, time: number): void {
        const aabb = this.aabb;
        const center = aabb.center;

        // Add glow effect
        ctx.save();
        ctx.shadowColor = this.isLocked ? '#ff6666' : '#aacc77';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        for (let i = 0; i < 3; i++) {
            if (this.isLocked) {
                ctx.drawImage(this.lockedSprite, center.x - this.lockedSprite.width / 2, center.y - this.lockedSprite.height / 2);
            } else {
                ctx.drawImage(this.openSprite, center.x - this.openSprite.width / 2, center.y - this.openSprite.height / 2);
            }
        }

        ctx.restore();

        if (this.isLocked) {
            ctx.drawImage(this.lockedSprite, center.x - this.lockedSprite.width / 2, center.y - this.lockedSprite.height / 2);
        } else {
            ctx.drawImage(this.openSprite, center.x - this.openSprite.width / 2, center.y - this.openSprite.height / 2);
        }
    }
}