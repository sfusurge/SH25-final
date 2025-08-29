import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { CELL_TYPE, CELL_SIZE, WALL_SIZE } from "$lib/components/maze/Maze";
import { AABB, Vector2 } from "$lib/Vector2";
import { MazeGenerator } from "./MazeGenerator";
import { ENTITY_TYPE } from "./Room";

export const debug = $state<{ [key: string]: any }>({
})

/**
 * Entity grid using actual maze cells for efficient collision detection
 */
class EntityGrid {
    gridWidth: number;
    gridHeight: number;
    offsetX: number;
    offsetY: number;
    grid: Entity[][][];

    constructor(roomWidth: number, roomHeight: number, offsetX: number, offsetY: number) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.gridWidth = roomWidth;
        this.gridHeight = roomHeight;

        this.grid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x] = [];
            }
        }
    }

    addEntity(entity: Entity) {
        const gridX = Math.floor((entity.x - this.offsetX) / CELL_SIZE);
        const gridY = Math.floor((entity.y - this.offsetY) / CELL_SIZE);

        if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
            this.grid[gridY][gridX].push(entity);
        }
    }

    getNearbyEntities(entity: Entity): Entity[] {
        const gridX = Math.floor((entity.x - this.offsetX) / CELL_SIZE);
        const gridY = Math.floor((entity.y - this.offsetY) / CELL_SIZE);

        const nearbyEntities = new Set<Entity>();

        // Check the entity's current cell and all 8 neighboring cells
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const checkX = gridX + dx;
                const checkY = gridY + dy;

                if (checkX >= 0 && checkX < this.gridWidth && checkY >= 0 && checkY < this.gridHeight) {
                    for (const e of this.grid[checkY][checkX]) {
                        if (e !== entity) { // Don't include the entity itself
                            nearbyEntities.add(e);
                        }
                    }
                }
            }
        }

        return Array.from(nearbyEntities);
    }


    clear() {
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x] = [];
            }
        }
    }

}
export class MazeGame {
    // TODO refactor for regenerating rooms
    mazeGenerator = new MazeGenerator(
        40, // maze width
        40, // maze height
        50, // attempts to generate rooms
        50, // winding percent for paths: 0 is straight corridors, 100 is max branching
        0.03 // random open percent: chance to create openings in a wall where the two regions it connects already are connected
    );

    maze = this.mazeGenerator.generate();
    rooms = this.mazeGenerator.rooms;
    idToRoomLayout = this.mazeGenerator.roomGenerator.idToRoomTemplate;
    currentRoomId: number = 0; // 0 means not in a room.

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    player: Player;
    mobileMode = false; // for controlling what input type to show
    camera = Vector2.ZERO;
    zoom = $state(1);
    joystickInput = Vector2.ZERO;

    // Entity grid for collision detection
    entityGrid: EntityGrid | null = null;
    lastRoomId: number = -1; // Track when we enter a new room

    //new Entity(new Vector2(200, 200), 100, 200)
    entities: Entity[] = [];

    horWallSprite = new Image();
    horWallPiller = new Image();
    verWallSprite = new Image();
    verWallCapSprite = new Image();
    rockSprite = new Image();
    trapSprite = new Image();
    scrollSprite = new Image();

    constructor(canvas: HTMLCanvasElement) {
        // load sprites
        this.horWallSprite.src = "/maze/wall_hor_short.png";
        this.verWallSprite.src = "/maze/wall_ver_short.png";
        this.verWallCapSprite.src = "/maze/wall_ver_cap.png";
        this.horWallPiller.src = "/maze/wall_piller.png";
        this.rockSprite.src = "/maze/rock_PLACEHOLDER.png";
        this.trapSprite.src = "/maze/trap.png";
        this.scrollSprite.src = "/maze/scroll.png";

        this.canvas = canvas;
        const ctx = canvas.getContext("2d", {});

        if (!ctx) {
            throw Error("unable to obtain rendering context");
        }
        this.ctx = ctx;

        // put player in a room
        const firstRoom = this.mazeGenerator.rooms[0];
        let playerStartX = Math.floor((firstRoom.x1 + firstRoom.x2) / 2);
        let playerStartY = Math.floor((firstRoom.y1 + firstRoom.y2) / 2);

        let foundSafeSpot = false;
        const firstRoomLayout = this.idToRoomLayout[firstRoom.regionID];

        for (let y = firstRoom.y1; y < firstRoom.y2 && !foundSafeSpot; y++) {
            for (let x = firstRoom.x1; x < firstRoom.x2 && !foundSafeSpot; x++) {
                if (!firstRoomLayout?.hasEntitiesAtPosition(x, y)) {
                    playerStartX = x;
                    playerStartY = y;
                    foundSafeSpot = true;
                }
            }
        }

        const playerStartPos = new Vector2(
            (playerStartX + 0.5) * CELL_SIZE,
            (playerStartY + 0.5) * CELL_SIZE
        );

        this.player = new Player(playerStartPos);
        this.detectMobileMode();
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

    detectMobileMode() {
        this.mobileMode = 'ontouchstart' in window || window.innerWidth <= 768;
    }

    setJoystickInput(input: Vector2) {
        this.joystickInput = input;
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

        // handle joystick input (takes priority over keyboard on mobile)
        if (this.mobileMode && (this.joystickInput.x !== 0 || this.joystickInput.y !== 0)) {
            x = this.joystickInput.x;
            y = this.joystickInput.y;
        }
        else if (!this.mobileMode) {
            // On desktop, combine keyboard and joystick inputs
            x += this.joystickInput.x;
            y += this.joystickInput.y;
        }

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
        this.resolveWallCollisions();
        this.resolveEntityCollisions();

        // this.collisionResolution(this.player, this.entities[0].aabb);
        this.render();

        this.lastTime = time;
        requestAnimationFrame(this.update.bind(this));
    }

    resolveWallCollisions() {
        const playerCol = Math.floor(this.player.x / CELL_SIZE);
        const playerRow = Math.floor(this.player.y / CELL_SIZE);

        let count = 0;

        // TODO, filter only the wall that matters
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, 1], [0, -1], [0, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
            const row = playerRow + dr;
            const col = playerCol + dc;

            if (!(row >= 0 && col >= 0 && row < this.maze.height && col < this.maze.width)) {
                continue;
            }

            const cell = this.maze.map[row * this.maze.width + col];
            const ox = col * CELL_SIZE, oy = row * CELL_SIZE;

            if (cell === CELL_TYPE.UNUSED) {
                continue;
            }

            if (cell & CELL_TYPE.LEFT) {
                const [_, x, y, w, h] = this.walls[0];
                this.collisionResolution(this.player, AABB.fromPosSize(x, y, w, h).shift(ox, oy));
                count += 1;
            }

            if (cell & CELL_TYPE.UP) {
                const [_, x, y, w, h] = this.walls[1];
                this.collisionResolution(this.player, AABB.fromPosSize(x, y, w, h).shift(ox, oy));
                count += 1;
            }

            if (cell & CELL_TYPE.RIGHT) {
                const [_, x, y, w, h] = this.walls[2];
                this.collisionResolution(this.player, AABB.fromPosSize(x, y, w, h).shift(ox, oy));
                count += 1;

            }

            if (cell & CELL_TYPE.DOWN) {
                const [_, x, y, w, h] = this.walls[3];
                this.collisionResolution(this.player, AABB.fromPosSize(x, y, w, h).shift(ox, oy));
                count += 1;

            }


            // const obstacleType = (cell & CELL_TYPE.OBSTACLE_TYPE_MASK) >> 14;
            // if (obstacleType === 1) { //rock - 2x2 tiles

            //     const halfCell = CELL_SIZE / 2;
            //     this.collisionResolution(this.player, AABB.fromPosSize(0, 0, halfCell, halfCell).shift(ox, oy));
            //     this.collisionResolution(this.player, AABB.fromPosSize(halfCell, 0, halfCell, halfCell).shift(ox, oy));
            //     this.collisionResolution(this.player, AABB.fromPosSize(0, halfCell, halfCell, halfCell).shift(ox, oy));
            //     this.collisionResolution(this.player, AABB.fromPosSize(halfCell, halfCell, halfCell, halfCell).shift(ox, oy));
            //     count += 4;
            // }
            // else if (obstacleType === 2) { // trap
            //     // TODO
            // }
            // else if (obstacleType === 3) { // scroll
            //     // TODO
            // }

        }

        debug.collisionResolutions = count;
    }

    resolveEntityCollisions() {
        if (!this.entityGrid || this.currentRoomId === 0) {
            return; // No spatial grid or not in a room
        }

        const nearbyEntities = this.entityGrid.getNearbyEntities(this.player);
        let entityCollisionCount = 0;

        for (const entity of nearbyEntities) {
            const entityType = entity.metadata?.entityType;

            switch (entityType) {
                case ENTITY_TYPE.rock:

                    this.collisionResolution(this.player, entity.aabb);
                    entityCollisionCount++;
                    break;

                case ENTITY_TYPE.trap:

                    if (this.player.aabb.collidingWith(entity.aabb)) {
                        this.handleTrapCollision(entity);
                        entityCollisionCount++;
                    }
                    break;

                case ENTITY_TYPE.scroll:
                    if (this.player.aabb.collidingWith(entity.aabb)) {
                        this.handleScrollCollision(entity);
                        entityCollisionCount++;
                    }
                    break;
            }
        }

        debug.entityCollisions = entityCollisionCount;
        debug.nearbyEntitiesCount = nearbyEntities.length;
    }

    handleTrapCollision(trapEntity: Entity) {
        // TODO: Implement trap effects
    }


    handleScrollCollision(scrollEntity: Entity) {
        // TODO: Implement scroll collection 
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

        // update entities
        const playerCol = Math.floor(this.player.x / CELL_SIZE);
        const playerRow = Math.floor(this.player.y / CELL_SIZE);

        const roomId = ((this.maze.map[playerRow * this.maze.width + playerCol] & CELL_TYPE.ROOM_MASK) >> 8) & 0b111111; // mask to only select room range.
        debug.roomId = roomId;
        this.currentRoomId = roomId;
        if (this.currentRoomId > 0) {
            if (this.currentRoomId !== this.lastRoomId) {
                this.rebuildEntityGrid();
                this.lastRoomId = this.currentRoomId;
            }
            const room = this.idToRoomLayout[this.currentRoomId];
            for (const e of room.entities) {
                e.update(this.deltaTime); // TODO trigger collision events.
            }
            room.entities.sort((a, b) => a.y - b.y); // sort by depth, to streamline rendering.
        }
    }

    rebuildEntityGrid() {
        if (this.currentRoomId <= 0) {
            this.entityGrid = null;
            return;
        }

        const room = this.idToRoomLayout[this.currentRoomId];
        if (!room) {
            this.entityGrid = null;
            return;
        }

        const roomOffsetX = room.left * CELL_SIZE;
        const roomOffsetY = room.top * CELL_SIZE;

        this.entityGrid = new EntityGrid(
            room.width,
            room.height,
            roomOffsetX,
            roomOffsetY
        );

        for (const entity of room.entities) {
            this.entityGrid.addEntity(entity);
        }

    }

    getCellRenderRange() {
        const lowX = Math.max(0, Math.floor(((this.camera.x - (this.canvas.width / (2 * this.zoom))) / (this.maze.width * CELL_SIZE)) * this.maze.width));
        const hightX = Math.min(this.maze.width, Math.floor(((this.camera.x + (this.canvas.width / (2 * this.zoom))) / (this.maze.width * CELL_SIZE)) * this.maze.width) + 2);
        const lowY = Math.max(0, Math.floor(((this.camera.y - (this.canvas.height / (2 * this.zoom))) / (this.maze.height * CELL_SIZE)) * this.maze.height));
        const hightY = Math.min(this.maze.height, Math.floor(((this.camera.y + (this.canvas.height / (2 * this.zoom))) / (this.maze.height * CELL_SIZE)) * this.maze.height) + 2);

        debug.renderRange = [lowX, hightX, lowY, hightY];
        return [lowX, hightX, lowY, hightY];
    }

    renderImageWithAspectRatio(
        ctx: CanvasRenderingContext2D,
        image: HTMLImageElement,
        x: number,
        y: number,
        maxSize: number,
        centerInCell: boolean = true
    ) {
        const naturalWidth = image.naturalWidth || image.width;
        const naturalHeight = image.naturalHeight || image.height;

        if (naturalWidth <= 0 || naturalHeight <= 0) {
            // Fallback to square rendering
            const offset = centerInCell ? (CELL_SIZE - maxSize) / 2 : 0;
            ctx.drawImage(image, x + offset, y + offset, maxSize, maxSize);
            return;
        }

        const aspectRatio = naturalWidth / naturalHeight;
        let renderWidth, renderHeight;

        if (aspectRatio > 1) {
            // Wider than tall
            renderWidth = maxSize;
            renderHeight = maxSize / aspectRatio;
        } else {
            // Taller than wide or square
            renderHeight = maxSize;
            renderWidth = maxSize * aspectRatio;
        }

        if (centerInCell) {
            const offsetX = (CELL_SIZE - renderWidth) / 2;
            const offsetY = (CELL_SIZE - renderHeight) / 2;
            ctx.drawImage(image, x + offsetX, y + offsetY, renderWidth, renderHeight);
        } else {
            ctx.drawImage(image, x, y, renderWidth, renderHeight);
        }
    }

    walls: [string, number, number, number, number][] = [
        ["#d3869b", -WALL_SIZE / 2, 0, WALL_SIZE, CELL_SIZE], // left
        ["#e78a4e", -WALL_SIZE / 2, -WALL_SIZE / 2, CELL_SIZE + WALL_SIZE, WALL_SIZE], // top,
        ["#a9b665", CELL_SIZE - WALL_SIZE / 2, 0, WALL_SIZE, CELL_SIZE], // right
        ["#7daea3", -WALL_SIZE / 2, CELL_SIZE - WALL_SIZE / 2, CELL_SIZE + WALL_SIZE, WALL_SIZE]// bot
    ]; // make horizontal walls longer to compensate shift towards neighbor walls
    render() {
        const ctx = this.ctx;
        ctx.resetTransform();
        ctx.fillStyle = "#161414";
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(Math.floor(-this.camera.x + this.canvas.width / (2 * this.zoom)), Math.floor(-this.camera.y + this.canvas.height / (2 * this.zoom)));


        const playerDepth = Math.floor((this.player.y / (this.maze.height * CELL_SIZE)) * this.maze.height);
        let count = 0;

        // render all backgrounds,
        const [lowX, highX, lowY, highY] = this.getCellRenderRange();

        for (let row = lowY; row < highY; row++) {
            // background pass
            for (let col = lowX; col < highX; col++) {
                const cell = this.maze.map[row * this.maze.width + col];

                if (cell === CELL_TYPE.UNUSED) {
                    ctx.fillStyle = "#161414";
                    ctx.fillRect(col * CELL_SIZE - 1, row * CELL_SIZE - 1, CELL_SIZE + 1, CELL_SIZE + 1);
                }
                else {
                    // paint default background color
                    ctx.fillStyle = "#7753A1";
                    ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            }
        }

        let roomEntityIdx = 0; // tracking how many items in room is already rendered
        let roomLayout = (this.currentRoomId > 0) ? this.idToRoomLayout[this.currentRoomId] : undefined;
        let roomEntities = roomLayout?.entities ?? undefined;
        for (let row = lowY; row < highY; row++) {
            // wall pass just for top walls
            for (let col = lowX; col < highX; col++) {
                const cell = this.maze.map[row * this.maze.width + col];

                if (cell !== CELL_TYPE.UNUSED && cell & CELL_TYPE.UP) {
                    ctx.translate(col * CELL_SIZE, row * CELL_SIZE);
                    count += 1;
                    const [color, x, y, w, h] = this.walls[1];
                    ctx.drawImage(this.horWallSprite, x, y - CELL_SIZE + WALL_SIZE * 2);

                    const hasRightCell = (col < this.maze.width - 1) && (this.maze.map[row * this.maze.width + col + 1] & CELL_TYPE.UP);
                    if (!hasRightCell) {
                        ctx.drawImage(this.horWallPiller, x + CELL_SIZE, y - WALL_SIZE * 2);
                    }
                    ctx.translate(-col * CELL_SIZE, -row * CELL_SIZE);
                }
            }

            // draw entities
            if (roomLayout && roomEntities) {
                // draw entities in room
                while (roomEntityIdx < roomEntities.length) {
                    const e = roomEntities[roomEntityIdx];
                    const depth = Math.floor(e.y / CELL_SIZE);
                    // console.log(depth, row);

                    if (depth !== row) {
                        break; // not the right depth to render
                    }

                    const eCol = Math.floor(e.x / CELL_SIZE);

                    if (true || eCol >= lowX || eCol < highX) {
                        // render entity in range
                        e.render(ctx, this.lastTime);
                    }
                    roomEntityIdx += 1;
                }
            }

            // player
            if (row === playerDepth) {
                this.player.render(ctx, this.lastTime);
            }


            // wall pass
            for (let col = lowX; col < highX; col++) {
                ctx.translate(col * CELL_SIZE, row * CELL_SIZE);
                count += 1;
                const cell = this.maze.map[row * this.maze.width + col];
                if (cell === CELL_TYPE.UNUSED) {
                    ctx.translate(-col * CELL_SIZE, -row * CELL_SIZE);
                    continue;
                }

                ctx.lineWidth = 2;


                if (cell & CELL_TYPE.LEFT) {
                    let inline = cell & CELL_TYPE.UP || (row < this.maze.height - 1 && (this.maze.map[(row + 1) * this.maze.width + col] & CELL_TYPE.LEFT));

                    const [color, x, y, w, h] = this.walls[0];
                    if (inline) {
                        ctx.drawImage(this.verWallCapSprite, x, y - CELL_SIZE / 2);
                    }
                    if (!inline || !(row < this.maze.height - 1 && (this.maze.map[(row + 1) * this.maze.width + col] & (CELL_TYPE.LEFT | CELL_TYPE.UP)))) {
                        ctx.drawImage(this.verWallSprite, x, y - CELL_SIZE + WALL_SIZE * 2);
                    }
                }

                if (cell & CELL_TYPE.RIGHT) {
                    let inline = cell & CELL_TYPE.UP || (row < this.maze.height - 1 && (this.maze.map[(row + 1) * this.maze.width + col] & CELL_TYPE.RIGHT));

                    const [color, x, y, w, h] = this.walls[2];

                    if (cell & CELL_TYPE.DOWN && (this.maze.map[(row + 1) * this.maze.width + col] & CELL_TYPE.UNUSED)) {
                        ctx.drawImage(this.verWallSprite, x, y - CELL_SIZE / 2);
                    }
                    else if (inline) {
                        ctx.drawImage(this.verWallCapSprite, x, y - CELL_SIZE / 2);
                    }

                    if (!inline || !(row < this.maze.height - 1 && (this.maze.map[(row + 1) * this.maze.width + col] & (CELL_TYPE.RIGHT | CELL_TYPE.UP)))) {
                        ctx.drawImage(this.verWallSprite, x, y - CELL_SIZE + WALL_SIZE * 2);
                    }
                }

                if (cell & CELL_TYPE.DOWN) {
                    const [color, x, y, w, h] = this.walls[3];
                    const hasRightCell = (col < this.maze.width - 1) && (this.maze.map[row * this.maze.width + col + 1] & CELL_TYPE.DOWN);
                    ctx.drawImage(this.horWallSprite, x, y - CELL_SIZE + WALL_SIZE * 2);

                    if (!hasRightCell) {
                        ctx.drawImage(this.horWallPiller, x + CELL_SIZE, y - WALL_SIZE * 2);
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

            // other entities
        }

        debug.cellRenderCount = count;
    }
}

const LEFT = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;

class Player extends Entity {

    renderWidth = 50;

    // TODO player stats
    accel = 4000;
    maxVel: number = 400;

    direction = DOWN;
    playerSpites: { [key: number]: HTMLCanvasElement[] };
    constructor(pos: Vector2) {
        super(pos, 30, 25);

        this.playerSpites = {
            [LEFT]: [
                loadImageToCanvas("/maze/player_sprites/player_left_neutral.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_left_walk_1.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_left_walk_2.webp", this.renderWidth),
            ],
            [RIGHT]: [
                loadImageToCanvas("/maze/player_sprites/player_left_neutral.webp", this.renderWidth, true),
                loadImageToCanvas("/maze/player_sprites/player_left_walk_1.webp", this.renderWidth, true),
                loadImageToCanvas("/maze/player_sprites/player_left_walk_2.webp", this.renderWidth, true),
            ],
            [UP]: [
                loadImageToCanvas("/maze/player_sprites/player_up_neutral.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_up_walk_1.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_up_walk_2.webp", this.renderWidth),
            ],
            [DOWN]: [
                loadImageToCanvas("/maze/player_sprites/player_down_neutral.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_down_walk_1.webp", this.renderWidth),
                loadImageToCanvas("/maze/player_sprites/player_down_walk_2.webp", this.renderWidth),
            ]
        };
    }

    /**
     * movement vector x,y where each value is a float [-1, 1].
     * movement should have magnitude clamped to 1 at most.
     * @param x
     * @param y
     * @param dt delta time since the last move input
     */
    onMoveInput(movement: Vector2, dt: number) {
        const mag = movement.mag();

        if (mag < 0.1) {
            movement = Vector2.ZERO;
        } else {
            const angle = movement.angle();
            if (angle >= -135 && angle <= -45) {
                this.direction = UP;
            } else if (angle >= -45 && angle < 45) {
                this.direction = RIGHT;
            } else if (angle >= 45 && angle < 135) {
                this.direction = DOWN;
            } else if (angle >= 135 || angle < -135) {
                this.direction = LEFT;
            }
        }

        this.move(movement, dt);

        debug.player = {
            vel: this.vel,
            move: movement,
            angle: this.direction
        }
    }

    render(ctx: CanvasRenderingContext2D, time: number): void {
        const trans = ctx.getTransform();

        const mag = this.vel.mag();
        const sprites = this.playerSpites[this.direction];

        let sprite = sprites[0];
        if (mag > 0.1) {
            debug.time = time;
            if (Math.round((time % 1000) / 250) % 2 === 0) { // alternate animation every 250 ms
                sprite = sprites[1];
            } else {
                sprite = sprites[2];
            }
        }

        ctx.translate(0, this.height / 2); // translate origin to bottom of player, then offset by image size
        ctx.translate(-sprite.width / 2, -sprite.height);
        ctx.drawImage(sprite, this.x, this.y);

        ctx.setTransform(trans);
    }
}