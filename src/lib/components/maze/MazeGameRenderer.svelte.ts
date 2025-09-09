import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { CELL_TYPE, CELL_SIZE, WALL_SIZE } from "$lib/components/maze/Maze";
import { AABB, Vector2 } from "$lib/Vector2";
import { MazeGenerator } from "./MazeGenerator";
import { Player, ProjectileEntity } from "./Entities";
import { gamePaused, gamePhase } from "./gameData/MazeGameData";
import { get } from "svelte/store";

export const debug = $state<{ [key: string]: any }>({
})

// Direction constants
const LEFT = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;

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

    clear() {
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x].length = 0;
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
    shootingJoystickInput = Vector2.ZERO;

    // Entity grid for collision detection
    entityGrid: EntityGrid | null = null;
    lastRoomId: number = -1; // Track when we enter a new room

    //new Entity(new Vector2(200, 200), 100, 200)
    entities: Entity[] = [];
    projectiles: ProjectileEntity[] = [];

    horWallSprite = new Image();
    horWallPillar = new Image();
    verWallSprite = new Image();
    verWallCapSprite = new Image();
    rockSprite = new Image();
    trapSprite = new Image();
    scrollSprite = new Image();

    constructor(canvas: HTMLCanvasElement) {
        // load sprites
        this.horWallSprite.src = "/maze/wall_hor_short.webp";
        this.verWallSprite.src = "/maze/wall_ver_short.webp";
        this.verWallCapSprite.src = "/maze/wall_ver_cap.webp";
        this.horWallPillar.src = "/maze/wall_pillar.webp";
        this.rockSprite.src = "/maze/rock_PLACEHOLDER.webp";
        this.trapSprite.src = "/maze/trap.webp";
        this.scrollSprite.src = "/maze/scroll.webp";

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
                    console.log("Found safe spot for player:", x, y);
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
        d: false,
        space: false,
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false
    };

    init() {

        this.canvas.focus();

        //keyboard input event
        this.canvas.addEventListener("keydown", (e) => {
            // Handle arrow keys
            if (e.key.startsWith('Arrow')) {
                e.preventDefault();
                if (e.key in this.keyMem) {
                    // @ts-ignore
                    this.keyMem[e.key] = true;
                }
            }
            // Handle other keys
            else if (e.key in this.keyMem) {
                // @ts-ignore
                this.keyMem[e.key] = true;
                e.preventDefault();
            }
            // Handle WASD keys (convert to lowercase)
            else if (e.key.toLowerCase() in this.keyMem) {
                // @ts-ignore
                this.keyMem[e.key.toLowerCase()] = true;
                e.preventDefault();
            }
            if (e.key === " ") {
                e.preventDefault();
                this.keyMem["space"] = true;
            }
        });
        this.canvas.addEventListener("keyup", (e) => {
            // Handle arrow keys
            if (e.key.startsWith('Arrow')) {
                e.preventDefault();
                if (e.key in this.keyMem) {
                    // @ts-ignore
                    this.keyMem[e.key] = false;
                }
            }
            // Handle other keys
            else if (e.key in this.keyMem) {
                e.preventDefault();
                // @ts-ignore
                this.keyMem[e.key] = false;
            }
            // Handle WASD keys (convert to lowercase)
            else if (e.key.toLowerCase() in this.keyMem) {
                e.preventDefault();
                // @ts-ignore :^(
                this.keyMem[e.key.toLowerCase()] = false;
            }
            if (e.key === " ") {
                e.preventDefault();
                this.keyMem["space"] = false;
            }
        });

        // Also prevent arrow key scrolling at the document level when canvas is focused
        document.addEventListener("keydown", (e) => {
            if (e.key.startsWith('Arrow') && document.activeElement === this.canvas) {
                e.preventDefault();
            }
        });

        // Ensure canvas stays focused when clicked
        this.canvas.addEventListener("click", () => {
            this.canvas.focus();
        });

        // start update loop
        requestAnimationFrame(this.update.bind(this));
    }

    reset() {
        // Generate a new maze
        this.mazeGenerator = new MazeGenerator(
            40, // maze width
            40, // maze height
            50, // attempts to generate rooms
            50, // winding percent for paths
            0.03 // random open percent
        );

        this.maze = this.mazeGenerator.generate();
        this.rooms = this.mazeGenerator.rooms;
        this.idToRoomLayout = this.mazeGenerator.roomGenerator.idToRoomTemplate;
        this.currentRoomId = 0;

        // Reset player position to first room
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

        // Reset player
        this.player.pos = playerStartPos;
        this.player.vel = Vector2.ZERO;
        this.player.immuneDuration = 0;
        this.player.shootCooldown = 0;

        // Clear entities and projectiles
        this.entities = [];
        this.projectiles = [];

        // Reset entity grid
        this.entityGrid = null;
        this.lastRoomId = -1;

        // Reset camera
        this.camera = Vector2.ZERO;
    }

    detectMobileMode() {
        this.mobileMode = 'ontouchstart' in window || window.innerWidth <= 768;
    }

    handleCanvasResize(width: number, height: number) {
        // Update canvas internal resolution to match display size
        this.canvas.width = width;
        this.canvas.height = height;

        // Scale the rendering context to account for device pixel ratio
        const dpr = window.devicePixelRatio || 1;
        this.ctx.scale(dpr, dpr);

        // Re-detect mobile mode in case window size changed
        this.detectMobileMode();
    }

    setJoystickInput(input: Vector2) {
        this.joystickInput = input;
    }

    setShootingJoystickInput(input: Vector2) {
        this.shootingJoystickInput = input;
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

        // DEBUG remove
        if (this.keyMem.space) {
            this.player.applyImpulse(Vector2.UNIT_Y.mul(600));
            this.keyMem.space = false;
        }

        return new Vector2(x, y).clampMagnitude(1);
    }

    getShootingInput() {
        // Handle joystick shooting input first (mobile)
        if (this.mobileMode && (this.shootingJoystickInput.x !== 0 || this.shootingJoystickInput.y !== 0)) {
            const magnitude = this.shootingJoystickInput.mag();

            // Only shoot if the joystick is moved significantly (dead zone)
            if (magnitude > 0.3) {
                // Convert joystick direction to discrete direction
                const angle = Math.atan2(this.shootingJoystickInput.y, this.shootingJoystickInput.x);
                const normalizedAngle = ((angle * 180 / Math.PI + 360) % 360);

                // Map angle to direction (with 45-degree ranges)
                if (normalizedAngle >= 315 || normalizedAngle < 45) {
                    return RIGHT;
                } else if (normalizedAngle >= 45 && normalizedAngle < 135) {
                    return DOWN;
                } else if (normalizedAngle >= 135 && normalizedAngle < 225) {
                    return LEFT;
                } else {
                    return UP;
                }
            }
        }

        // Handle keyboard shooting input (desktop)
        if (this.keyMem.ArrowUp) return UP;
        if (this.keyMem.ArrowDown) return DOWN;
        if (this.keyMem.ArrowLeft) return LEFT;
        if (this.keyMem.ArrowRight) return RIGHT;

        return -1; // no shooting input
    }

    addProjectile(projectile: ProjectileEntity) {
        this.projectiles.push(projectile);
    }

    updateCameraPos() {
        // TODO
        this.camera.x = this.player.x;
        this.camera.y = this.player.y;
    }

    lastTime = 0;
    deltaTime = 0;
    update(time: number) {
        // Skip game updates if paused or not in running phase, but continue the animation loop
        if (get(gamePaused) || get(gamePhase) !== 'running') {
            this.lastTime = time;
            requestAnimationFrame(this.update.bind(this));
            return;
        }

        this.deltaTime = (time - this.lastTime) / 1000;
        debug.delta = this.deltaTime.toFixed(4);

        if (this.deltaTime > 0.1) {
            this.lastTime = time;
            requestAnimationFrame(this.update.bind(this));
            return;
        }

        this.updateCameraPos();
        this.updateEntities();
        this.resolveEntityCollisions();

        // this.collisionResolution(this.player, this.entities[0].aabb);
        this.render();

        this.lastTime = time;
        requestAnimationFrame(this.update.bind(this));
    }

    resolveWallCollisions(entity: Entity) {
        const eCol = Math.floor(entity.x / CELL_SIZE);
        const eRow = Math.floor(entity.y / CELL_SIZE);

        // TODO, filter only the wall that matters
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, 1], [0, -1], [0, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
            const row = eRow + dr;
            const col = eCol + dc;

            if (!(row >= 0 && col >= 0 && row < this.maze.height && col < this.maze.width)) {
                continue;
            }

            const cell = this.maze.map[row * this.maze.width + col];
            const ox = col * CELL_SIZE, oy = row * CELL_SIZE;

            if (cell === CELL_TYPE.SOLID) {
                continue;
            }

            if (cell & CELL_TYPE.LEFT) {
                const [_, x, y, w, h] = this.walls[0];
                entity.resolveCollision(AABB.fromPosSize(x, y, w, h).shift(ox, oy));
            }

            if (cell & CELL_TYPE.UP) {
                const [_, x, y, w, h] = this.walls[1];
                entity.resolveCollision(AABB.fromPosSize(x, y, w, h).shift(ox, oy));
            }

            if (cell & CELL_TYPE.RIGHT) {
                const [_, x, y, w, h] = this.walls[2];
                entity.resolveCollision(AABB.fromPosSize(x, y, w, h).shift(ox, oy));
            }

            if (cell & CELL_TYPE.DOWN) {
                const [_, x, y, w, h] = this.walls[3];
                entity.resolveCollision(AABB.fromPosSize(x, y, w, h).shift(ox, oy));
            }
        }
    }

    resolveEntityCollisions() {
        this.resolveWallCollisions(this.player);
        this.updateEntityGrid();
        // Handle projectile wall collisions
        for (const projectile of this.projectiles) {
            this.resolveWallCollisions(projectile);
        }

        if (!this.entityGrid || this.currentRoomId === 0) {
            return;
        }

        const room = this.idToRoomLayout[this.currentRoomId];
        if (!room) {
            return;
        }

        // Get all entities in room
        const allEntities = [this.player, ...room.dynamicEntities];
        let entityCollisionCount = 0;

        for (const e of allEntities) {
            this.resolveWallCollisions(e);
        }


        // TODO, only check for collisions in grid
        // Handle projectile vs entity collisions
        for (const projectile of this.projectiles) {
            // projectile vs player
            if (projectile.aabb.collidingWith(this.player.aabb)) {
                projectile.onCollision(this.player, this);
                this.player.onCollision(projectile, this);
            }

            // projectile vs room entities
            for (const entity of room.entities) {
                if (projectile.aabb.collidingWith(entity.aabb)) {
                    projectile.onCollision(entity, this);
                    entity.onCollision(projectile, this);
                }
            }
        }

        // pairwise checks
        for (let i = 0; i < allEntities.length; i++) {
            const entityA = allEntities[i];

            const gridX = Math.floor((entityA.x - this.entityGrid.offsetX) / CELL_SIZE);
            const gridY = Math.floor((entityA.y - this.entityGrid.offsetY) / CELL_SIZE);

            // Check the entity's current cell and all 8 neighboring cells
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const checkX = gridX + dx;
                    const checkY = gridY + dy;

                    if (checkX >= 0 && checkX < this.entityGrid.gridWidth &&
                        checkY >= 0 && checkY < this.entityGrid.gridHeight) {

                        // Check all entities in this grid cell
                        for (const entityB of this.entityGrid.grid[checkY][checkX]) {
                            if (entityA === entityB) {
                                continue;
                            }

                            // Skip if entityB was already checked (avoid doubling up)
                            const entityBIndex = allEntities.indexOf(entityB);
                            if (entityBIndex !== -1 && entityBIndex <= i) {
                                continue;
                            }

                            const isColliding = entityA.aabb.collidingWith(entityB.aabb);

                            if (isColliding) {
                                entityCollisionCount++;
                                entityA.onCollision(entityB, this);
                                entityB.onCollision(entityA, this);
                            }
                        }
                    }
                }
            }
        }

        debug.entityCollisions = entityCollisionCount;
        debug.projectileCount = this.projectiles.length;

    }
    /**
     * updates velocity of all entities and then move according to vel.
     */
    updateEntities() {
        // update player
        this.player.onMoveInput(this.getPlayerInput(), this.deltaTime);

        // Handle shooting input
        const shootDirection = this.getShootingInput();
        this.player.onShootInput(shootDirection, this);

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(this, this.deltaTime);

            // Remove if destroyed
            if (projectile.metadata.destroyed) {
                this.projectiles.splice(i, 1);
            }
        }

        // update entities
        const playerCol = Math.floor(this.player.x / CELL_SIZE);
        const playerRow = Math.floor(this.player.y / CELL_SIZE);

        // Ensure player position is within maze bounds before accessing maze.map
        let roomId = 0;
        if (playerRow >= 0 && playerRow < this.maze.height &&
            playerCol >= 0 && playerCol < this.maze.width) {
            const cellIndex = playerRow * this.maze.width + playerCol;
            if (cellIndex >= 0 && cellIndex < this.maze.map.length) {
                roomId = ((this.maze.map[cellIndex] & CELL_TYPE.ROOM_MASK) >> 8) & 0b111111;
            }
        }
        debug.roomId = roomId;
        this.currentRoomId = roomId;
        if (this.currentRoomId > 0) {
            if (this.currentRoomId !== this.lastRoomId) {
                this.rebuildEntityGrid(); // TODO respawn enemy
                this.lastRoomId = this.currentRoomId;
            }
            const room = this.idToRoomLayout[this.currentRoomId];
            for (const e of room.entities) {
                e.update(this, this.deltaTime);
            }

            // Remove destroyed entities
            room.entities = room.entities.filter(e => !e.metadata.destroyed);
            room.dynamicEntities = room.dynamicEntities.filter(e => !e.metadata.destroyed);
        }
        this.player.update(this, this.deltaTime);
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

        // Add all entities to the grid, including player
        this.entityGrid.addEntity(this.player);
        for (const entity of room.entities) {
            this.entityGrid.addEntity(entity);
        }
    }

    updateEntityGrid() {
        if (this.currentRoomId <= 0) {
            return;
        }
        const room = this.idToRoomLayout[this.currentRoomId];
        if (!room) {
            return;
        }
        const grid = this.entityGrid;

        if (!grid) {
            return;
        }

        grid.clear();
        // Add all entities to the grid, including player
        grid.addEntity(this.player);
        for (const entity of room.entities) {
            grid.addEntity(entity);
        }
    }

    getRoomsOnScreen(lowX: number, highX: number, lowY: number, highY: number) {
        const out = new Set<number>();
        for (let row = lowY; row < highY; row++) {
            for (let col = lowX; col < highX; col++) {
                const cellId = (this.maze.map[row * this.maze.width + col] & CELL_TYPE.ROOM_MASK) >> 8;
                if (cellId > 0) {
                    out.add(cellId);
                }
            }
        }
        return Array.from(out);
    }

    getCellRenderRange() {
        const dpr = window.devicePixelRatio || 1;
        const canvasWidth = this.canvas.width / dpr;
        const canvasHeight = this.canvas.height / dpr;

        const lowX = Math.max(0, Math.floor(((this.camera.x - (canvasWidth / (2 * this.zoom))) / (this.maze.width * CELL_SIZE)) * this.maze.width) - 1);
        const hightX = Math.min(this.maze.width, Math.floor(((this.camera.x + (canvasWidth / (2 * this.zoom))) / (this.maze.width * CELL_SIZE)) * this.maze.width) + 2);
        const lowY = Math.max(0, Math.floor(((this.camera.y - (canvasHeight / (2 * this.zoom))) / (this.maze.height * CELL_SIZE)) * this.maze.height) - 1);
        const hightY = Math.min(this.maze.height, Math.floor(((this.camera.y + (canvasHeight / (2 * this.zoom))) / (this.maze.height * CELL_SIZE)) * this.maze.height) + 2);

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
        const dpr = window.devicePixelRatio || 1;

        ctx.resetTransform();

        // Apply device pixel ratio scaling
        ctx.scale(dpr, dpr);

        ctx.fillStyle = "#161414";
        ctx.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(Math.floor(-this.camera.x + (this.canvas.width / dpr) / (2 * this.zoom)), Math.floor(-this.camera.y + (this.canvas.height / dpr) / (2 * this.zoom)));


        const playerDepth = Math.floor((this.player.y / (this.maze.height * CELL_SIZE)) * this.maze.height);
        let renderCount = 0;

        // render all backgrounds,
        const [lowX, highX, lowY, highY] = this.getCellRenderRange();

        // ======= BACKGROUND ====== //
        for (let row = lowY; row < highY; row++) {

            for (let col = lowX; col < highX; col++) {
                const cell = this.maze.map[row * this.maze.width + col];

                if (cell === CELL_TYPE.SOLID) {
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
        // ======= END BACKGROUND ====== //



        // ===== ROOM ====== //
        let currentRoomDynamicEntities = undefined;
        let dynamicRenderIdx = 0;
        if (this.currentRoomId > 0) {
            currentRoomDynamicEntities = this.idToRoomLayout[this.currentRoomId].dynamicEntities;
            currentRoomDynamicEntities.sort((a, b) => a.y - b.y);
        }

        for (let row = lowY; row < highY; row++) {
            // ======= TOP WALL ======
            for (let col = lowX; col < highX; col++) {
                const cell = this.maze.map[row * this.maze.width + col];

                if (cell !== CELL_TYPE.SOLID && cell & CELL_TYPE.UP) {
                    ctx.translate(col * CELL_SIZE, row * CELL_SIZE);
                    renderCount += 1;
                    const [color, x, y, w, h] = this.walls[1];
                    ctx.drawImage(this.horWallSprite, x, y - CELL_SIZE + WALL_SIZE * 2);

                    const hasRightCell = (col < this.maze.width - 1) && (this.maze.map[row * this.maze.width + col + 1] & CELL_TYPE.UP);
                    if (!hasRightCell) {
                        ctx.drawImage(this.horWallPillar, x + CELL_SIZE, y - WALL_SIZE * 2);
                    }
                    ctx.translate(-col * CELL_SIZE, -row * CELL_SIZE);
                }
            }

            // ====== STATIC ENTITIES ======
            for (const roomId of this.getRoomsOnScreen(lowX, highX, lowY, highY)) {

                const roomLayout = this.idToRoomLayout[roomId];
                if (row > roomLayout.bottom || row < roomLayout.top) {
                    continue;
                }

                const startRow = (row - roomLayout.top) * 2;
                for (let r = startRow; r < Math.min(roomLayout.staticEntities.length, startRow + 2); r++) {
                    const entitiesInRow = roomLayout.staticEntities[r];

                    for (const e of entitiesInRow) {
                        if (e) {
                            const col = Math.floor(e.x / CELL_SIZE);
                            if (col >= lowX && col < highX) {
                                e.render(ctx, this.lastTime);
                            }
                        }
                    }
                }
            }

            // ====== DYNAMIC ENTITY ====== //
            if (currentRoomDynamicEntities) {
                debug.entitiesDepth = (currentRoomDynamicEntities.map(item => item.y.toFixed(0)).join(", "));

                while (dynamicRenderIdx < currentRoomDynamicEntities.length) {
                    const entity = currentRoomDynamicEntities[dynamicRenderIdx];
                    const depth = Math.round(entity.y / CELL_SIZE);

                    if (row > depth) {
                        dynamicRenderIdx += 1;
                        continue;
                    }
                    if (depth !== row) {
                        break;
                    }

                    entity.render(ctx, this.lastTime);
                    dynamicRenderIdx += 1;
                }
            }

            // ====== PLAYER ====== //
            if (row === playerDepth) {
                this.player.render(ctx, this.lastTime);
            }

            // ====== PROJECTILES ====== //
            for (const projectile of this.projectiles) {
                const projectileDepth = Math.floor(projectile.y / CELL_SIZE);
                if (projectileDepth === row) {
                    const col = Math.floor(projectile.x / CELL_SIZE);
                    if (col >= lowX && col < highX) {
                        projectile.render(ctx, this.lastTime);
                    }
                }
            }

            // ======= OTHER WALLS ======
            for (let col = lowX; col < highX; col++) {
                ctx.translate(col * CELL_SIZE, row * CELL_SIZE);
                renderCount += 1;
                const cell = this.maze.map[row * this.maze.width + col];
                if (cell === CELL_TYPE.SOLID) {
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

                    if (cell & CELL_TYPE.DOWN && (this.maze.map[(row + 1) * this.maze.width + col] & CELL_TYPE.SOLID)) {
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
                        ctx.drawImage(this.horWallPillar, x + CELL_SIZE, y - WALL_SIZE * 2);
                    }
                }

                ctx.translate(-col * CELL_SIZE, -row * CELL_SIZE);
            }
        }

        debug.cellRenderCount = renderCount;
    }
}



