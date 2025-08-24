import { Entity } from "$lib/components/maze/Entity";
import { CELL_TYPE } from "$lib/components/maze/Maze";
import { AABB, Vector2 } from "$lib/Vector2";
import { MazeGenerator } from "./MazeGenerator";

export const debug = $state<{ [key: string]: any }>({
})

const CELL_SIZE = 100; // px
const WALL_SIZE = 10;

export class MazeGame {

    mazeGenerator = new MazeGenerator(
        40, // maze width
        40, // maze height
        50, // attempts to generate rooms
        3, // min room size 
        7, // max room size (before rectangularity)
        50, // winding percent for paths: 0 is straight corridors, 100 is max branching
        3, // rectangularity: higher vals make more rectangular rooms
        0.02 // random open percent: chance to create openings in a wall where the two regions it connects already are connected
    );

    maze = this.mazeGenerator.generate();

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    player: Player;
    mobileMode = false; // for controlling what input type to show
    camera = Vector2.ZERO;
    zoom = $state(1);

    //new Entity(new Vector2(200, 200), 100, 200)
    entities: Entity[] = [];

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext("2d", {});

        if (!ctx) {
            throw Error("unable to obtain rendering context");
        }
        this.ctx = ctx;

        // put player in a room idk
        const firstRoom = this.mazeGenerator.rooms[0];
        const roomCenterX = (firstRoom.x1 + firstRoom.x2) / 2;
        const roomCenterY = (firstRoom.y1 + firstRoom.y2) / 2;
        const playerStartPos = new Vector2(
            roomCenterX * CELL_SIZE,
            roomCenterY * CELL_SIZE
        );

        this.player = new Player(playerStartPos);
        this.init();
    }

    keyMem = {
        w: false,
        a: false,
        s: false,
        d: false
    };

    init() {
        //keyboard input event
        this.canvas.addEventListener("keydown", (e) => {
            console.log(e.key, e.key in this.keyMem);

            if (e.key in this.keyMem) {
                // @ts-ignore
                this.keyMem[e.key] = true;
            }
        });
        this.canvas.addEventListener("keyup", (e) => {
            if (e.key in this.keyMem) {
                // @ts-ignore :^(
                this.keyMem[e.key] = false;
            }
        })


        // start update loop
        requestAnimationFrame(this.update.bind(this));
    }

    getPlayerInput() {
        let x = 0;
        let y = 0;

        // handle keyboard input
        if (this.keyMem.w) {
            y -= 1;
        }

        if (this.keyMem.s) {
            y += 1;
        }

        if (this.keyMem.a) {
            x -= 1;
        }

        if (this.keyMem.d) {
            x += 1;
        }

        //... add other handlings

        return new Vector2(x, y).clampMagnitude(1);
    }

    updateCameraPos() {
        // TODO
        this.camera.x = this.player.x;
        this.camera.y = this.player.y;
    }

    lastTime = 0;
    deltaTime = 0;
    update(time: number) {
        this.deltaTime = (time - this.lastTime) / 1000;
        debug.delta = this.deltaTime.toFixed(4);

        this.updateCameraPos();
        this.updateEntities();
        this.resolveWallCollisions()
        // this.collsionResolution(this.player, this.entities[0].aabb);
        this.render();

        this.lastTime = time;
        requestAnimationFrame(this.update.bind(this));
    }

    resolveWallCollisions() {
        const playerCol = Math.floor(this.player.x / CELL_SIZE);
        const playerRow = Math.floor(this.player.y / CELL_SIZE);

        // TODO, filter only the wall that matters
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, 1], [0, -1], [0, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
            const row = playerRow + dr;
            const col = playerCol + dc;

            if (!(row >= 0 && col >= 0 && row < this.maze.height && col < this.maze.width)) {
                continue;
            }

            const cell = this.maze.map[row * this.maze.width + col];
            const ox = col * CELL_SIZE, oy = row * CELL_SIZE;

            if (cell & CELL_TYPE.LEFT) {
                const [_, x, y, w, h] = this.walls[0];
                this.collisionResolution(this.player, AABB.fromPosSize(x, y, w, h).shift(ox, oy));
            }

            if (cell & CELL_TYPE.UP) {
                const [_, x, y, w, h] = this.walls[1];
                this.collisionResolution(this.player, AABB.fromPosSize(x, y, w, h).shift(ox, oy));
            }

            if (cell & CELL_TYPE.RIGHT) {
                const [_, x, y, w, h] = this.walls[2];
                this.collisionResolution(this.player, AABB.fromPosSize(x, y, w, h).shift(ox, oy));
            }

            if (cell & CELL_TYPE.DOWN) {
                const [_, x, y, w, h] = this.walls[3];
                this.collisionResolution(this.player, AABB.fromPosSize(x, y, w, h).shift(ox, oy));
            }

        }
    }

    collisionResolution(entity: Entity, b: AABB) {
        const a = entity.aabb;
        debug.hasCollision = a.collidingWith(b);

        const isColliding = a.collidingWith(b);

        if (!isColliding) {
            entity.maxVelMod = 1;
            return;
        }

        // intersection dist of how far A went into B
        let px = 0, py = 0; //

        if (a.right > b.left && a.left < b.right) {
            // a is intersecting b from left
            px = b.left - a.right;
        }

        // a intersection from right
        if (a.left < b.right && a.right > b.left) {
            const temp = b.right - a.left;

            if (Math.abs(temp) < Math.abs(px)) {
                px = temp; // pick which small magnitude direction to move
            }
        }

        // a intersect from above
        if (a.bot > b.top && a.top < b.bot) {
            py = b.top - a.bot;
        }

        // a intersect from below
        if (a.top < b.bot && a.bot > b.top) {
            const temp = b.bot - a.top;
            if (Math.abs(temp) < Math.abs(py)) {
                py = temp;
            }
        }

        if (Math.abs(px) < Math.abs(py)) {
            entity.vel.x = 0;
            entity.maxVelMod = 0.5; // apply fake friction
            entity.pos.x += px * 1.01;
        } else {
            entity.maxVelMod = 0.5;
            entity.vel.y = 0;
            entity.pos.y += py * 1.01;
        }
    }


    /**
     * updates velocity of all entities and then move according to vel.
     */
    updateEntities() {
        // update player
        this.player.onMoveInput(this.getPlayerInput(), this.deltaTime);

        // update all other entities
    }

    walls: [string, number, number, number, number][] = [
        ["#d3869b", -WALL_SIZE / 2, 0, WALL_SIZE, CELL_SIZE], // left
        ["#e78a4e", -WALL_SIZE / 2, -WALL_SIZE / 2, CELL_SIZE + WALL_SIZE, WALL_SIZE], // top,
        ["#a9b665", CELL_SIZE - WALL_SIZE / 2, 0, WALL_SIZE, CELL_SIZE], // right
        ["#7daea3", -WALL_SIZE / 2, CELL_SIZE - WALL_SIZE / 2, CELL_SIZE + WALL_SIZE, WALL_SIZE]// bot
    ];
    render() {
        const ctx = this.ctx;
        ctx.resetTransform();
        ctx.fillStyle = "#F1ECEB";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        ctx.scale(Math.floor(this.zoom * 10) / 10, Math.floor(this.zoom * 10) / 10);
        ctx.translate(Math.floor(-this.camera.x + this.canvas.width / (2 * this.zoom)), Math.floor(-this.camera.y + this.canvas.height / (2 * this.zoom)));


        // render all backgrounds,
        // TODO optimazation, background is non-interactive and can be prerendered
        for (let row = 0; row < this.maze.height; row++) {
            for (let col = 0; col < this.maze.width; col++) {
                ctx.translate(col * CELL_SIZE, row * CELL_SIZE);

                const cell = this.maze.map[row * this.maze.width + col];
                if (cell === CELL_TYPE.UNUSED) {
                    ctx.fillStyle = "#222222";
                    ctx.fillRect(0, 0, CELL_SIZE, CELL_SIZE);
                }
                else {
                    if (cell & CELL_TYPE.LEFT) {
                        const [color, x, y, w, h] = this.walls[0];
                        ctx.fillStyle = color;
                        ctx.fillRect(x, y, w, h);
                    }

                    if (cell & CELL_TYPE.UP) {
                        const [color, x, y, w, h] = this.walls[1];
                        ctx.fillStyle = color;
                        ctx.fillRect(x, y, w, h);
                    }

                    if (cell & CELL_TYPE.RIGHT) {
                        const [color, x, y, w, h] = this.walls[2];
                        ctx.fillStyle = color;
                        ctx.fillRect(x, y, w, h);
                    }

                    if (cell & CELL_TYPE.DOWN) {
                        const [color, x, y, w, h] = this.walls[3];
                        ctx.fillStyle = color;
                        ctx.fillRect(x, y, w, h);
                    }
                }

                ctx.translate(-col * CELL_SIZE, -row * CELL_SIZE);

                // const doorColor = "#ccccbb";
                // if (cell & CELL_TYPE.LEFT_DOOR) {
                //     ctx.fillStyle = doorColor;
                //     ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, WALL_SIZE, CELL_SIZE);

                // }
                // if (cell & CELL_TYPE.UP_DOOR) {
                //     ctx.fillStyle = doorColor;
                //     ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, WALL_SIZE);
                // }
                // if (cell & CELL_TYPE.RIGHT_DOOR) {
                //     ctx.fillStyle = doorColor;
                //     ctx.fillRect(col * CELL_SIZE + CELL_SIZE - WALL_SIZE, row * CELL_SIZE, WALL_SIZE, CELL_SIZE);
                // }
                // if (cell & CELL_TYPE.DOWN_DOOR) {
                //     ctx.fillStyle = doorColor;
                //     ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE + CELL_SIZE - WALL_SIZE, CELL_SIZE, WALL_SIZE);
                // }

            }
        }

        // render entities
        // TODO remove
        ctx.fillStyle = "#7daea3";
        for (const e of this.entities) {
            ctx.fillRect(e.x - e.width / 2, e.y - e.height / 2, e.width, e.height);
        }

        // render player
        ctx.translate(this.player.x, this.player.y);
        this.player.render(ctx);
    }
}


class Player extends Entity {

    // TODO player stats
    accel = 40000;
    maxVel: number = 1500;

    constructor(pos: Vector2) {
        super(pos, 50, 50);
    }
    /**
     * movement vector x,y where each value is a float [-1, 1].
     * movement should have magnitude clamped to 1 at most.
     * @param x
     * @param y
     * @param dt delta time since the last move input
     */
    onMoveInput(movement: Vector2, dt: number) {
        this.move(movement, dt);
        debug.player = {
            vel: this.vel,
            move: movement
        }

    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "#ea6962";
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
}