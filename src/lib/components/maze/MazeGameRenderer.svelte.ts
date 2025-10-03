import { Entity, loadImageToCanvas } from "$lib/components/maze/Entity";
import { ENTITY_TYPE, LEFT, RIGHT, UP, DOWN, Player, ProjectileEntity, DoorEntity } from "$lib/components/maze/entities/index.ts";
import { CELL_TYPE, CELL_SIZE, WALL_SIZE } from "$lib/components/maze/Maze";
import { AABB, Vector2 } from "$lib/Vector2";
import { MazeGenerator } from "./MazeGenerator";
import { GameState } from "./MazeGameState.svelte.ts";
import { DoorTransitionState } from "./DoorTransitionState.svelte.ts";
import { EffectSystem } from "./EffectSystem.svelte.ts";

export const debug = $state<{ [key: string]: any }>({
})

const mazeConfig = {
    width: 40,
    height: 40,
    roomAttempts: 70,
    windingPercent: 40,
    randomOpenPercent: 0.04
};

type PreparedMazeData = {
    mazeGenerator: MazeGenerator;
    maze: ReturnType<MazeGenerator["generate"]>;
};


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
        mazeConfig.width,
        mazeConfig.height,
        mazeConfig.roomAttempts,
        mazeConfig.windingPercent,
        mazeConfig.randomOpenPercent
    );

    maze = this.mazeGenerator.generate();
    rooms = this.mazeGenerator.rooms;
    idToRoomLayout = this.mazeGenerator.roomGenerator.idToRoomTemplate;
    currentRoomId: number = 0; // 0 means not in a room.
    roomsCleared = new Map<number, boolean>(); // Track which rooms have been cleared of enemies

    // Overlay transition state
    overlayOpacity = 0;
    overlayTargetOpacity = 0;
    overlayTransitionSpeed = 6; // percent change per frame
    lastOverlayState = false; // Track previous overlay state for transition detection
    doorTransitionActive = false;

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
    effects = new EffectSystem();

    private pendingMazeData: PreparedMazeData | null = null;
    private pendingMazeReady = false;
    private isPreparingNextFloor = false;

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
        this.rockSprite.src = "/maze/rock.webp";
        this.trapSprite.src = "/maze/trap.webp";
        this.scrollSprite.src = "/maze/scroll.webp";

        this.canvas = canvas;
        const ctx = canvas.getContext("2d", {});

        if (!ctx) {
            throw Error("unable to obtain rendering context");
        }
        this.ctx = ctx;

        const playerStartPos = this.findHallwayStartPosition();
        this.player = new Player(playerStartPos);
        this.effects.setPlayer(this.player);
        this.effects.setGame(this);
        this.detectMobileMode();
        this.init();
    }

    private createMazeData(): PreparedMazeData {
        const mazeGenerator = new MazeGenerator(
            mazeConfig.width,
            mazeConfig.height,
            mazeConfig.roomAttempts,
            mazeConfig.windingPercent,
            mazeConfig.randomOpenPercent,
            GameState.currentLevel
        );

        const maze = mazeGenerator.generate();
        return { mazeGenerator, maze };
    }

    private applyMazeData(data: PreparedMazeData) {
        this.mazeGenerator = data.mazeGenerator;
        this.maze = data.maze;
        this.rooms = this.mazeGenerator.rooms;
        this.idToRoomLayout = this.mazeGenerator.roomGenerator.idToRoomTemplate;
        this.pendingMazeReady = false;
        this.isPreparingNextFloor = false;
    }

    private applyPendingMazeData() {
        const data = this.pendingMazeData ?? this.createMazeData();
        this.pendingMazeData = null;
        this.applyMazeData(data);
    }

    private prepareNextFloor() {
        if (this.pendingMazeData) {
            if (!this.pendingMazeReady) {
                this.pendingMazeReady = true;
                DoorTransitionState.markTransitionReady();
            }
            return;
        }

        if (this.isPreparingNextFloor) {
            return;
        }

        this.pendingMazeReady = false;
        this.isPreparingNextFloor = true;

        requestAnimationFrame(() => {
            this.pendingMazeData = this.createMazeData();
            this.pendingMazeReady = true;
            this.isPreparingNextFloor = false;
            DoorTransitionState.markTransitionReady();
        });
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

    clearAllKeys() {
        for (const key in this.keyMem) {
            // @ts-ignore
            this.keyMem[key] = false;
        }
    }

    findHallwayStartPosition(): Vector2 {
        // Find a hallway position near the center of the maze
        const centerX = Math.floor(this.maze.width / 2);
        const centerY = Math.floor(this.maze.height / 2);

        let playerStartX = centerX;
        let playerStartY = centerY;
        let foundHallwaySpot = false;

        // Search in expanding circles from the center for a hallway position
        for (let radius = 0; radius < Math.max(this.maze.width, this.maze.height) / 2 && !foundHallwaySpot; radius++) {
            for (let dx = -radius; dx <= radius && !foundHallwaySpot; dx++) {
                for (let dy = -radius; dy <= radius && !foundHallwaySpot; dy++) {
                    // Only check cells at the current radius (not already checked)
                    if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

                    const x = centerX + dx;
                    const y = centerY + dy;

                    // Check bounds
                    if (x < 0 || x >= this.maze.width || y < 0 || y >= this.maze.height) continue;

                    const cellIndex = y * this.maze.width + x;
                    const cell = this.maze.map[cellIndex];

                    // Check if it's a hallway 
                    const roomId = ((cell & CELL_TYPE.ROOM_MASK) >> 8) & 0b111111;
                    if (cell !== CELL_TYPE.SOLID && roomId === 0) {
                        playerStartX = x;
                        playerStartY = y;
                        foundHallwaySpot = true;
                    }
                }
            }
        }

        // Fallback just in case
        if (!foundHallwaySpot) {
            console.log("No hallway found near center, so using first room as fallback");
            const firstRoom = this.mazeGenerator.rooms[0];
            playerStartX = Math.floor((firstRoom.x1 + firstRoom.x2) / 2);
            playerStartY = Math.floor((firstRoom.y1 + firstRoom.y2) / 2);
        }

        return new Vector2(
            (playerStartX + 0.5) * CELL_SIZE,
            (playerStartY + 0.5) * CELL_SIZE
        );
    }

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
        this.canvas.addEventListener("click", (e) => {
            e.stopPropagation();
            this.canvas.focus();
        });

        // prevent stuck keys
        this.canvas.addEventListener("blur", () => {
            this.clearAllKeys();
        });

        // start update loop
        requestAnimationFrame(this.update.bind(this));
    }

    reset() {
        this.applyPendingMazeData();
        this.currentRoomId = 0;
        this.roomsCleared.clear();

        // Reset player position to hallway near center
        const playerStartPos = this.findHallwayStartPosition();

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
        this.doorTransitionActive = false;
        DoorTransitionState.reset();

        // Clear power-up state (only on full game reset, not between levels)
        // Effects should persist between levels
        // this.effects.reset();
    }

    resetEffects() {
        // Separate method for resetting effects (called only on full game restart)
        this.effects.reset();
    }

    detectMobileMode() {
        const isTouchDevice = 'ontouchstart' in window;
        const isSmallScreen = window.innerWidth < 768;
        this.mobileMode = isTouchDevice || isSmallScreen;
    }

    handleCanvasResize(width: number, height: number) {
        const dpr = window.devicePixelRatio || 1;

        // Setting width/height resets the context state, including transforms
        this.canvas.width = width;
        this.canvas.height = height;

        // Apply device-pixel-ratio scaling with a fresh transform matrix
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Re-detect mobile mode in case window size changed
        this.detectMobileMode();
    }

    setJoystickInput(input: Vector2) {
        this.joystickInput = input;
    }

    setShootingJoystickInput(input: Vector2) {
        this.shootingJoystickInput = input;
    }

    beginDoorEntry(door: DoorEntity) {
        if (!door || door.isLocked) {
            return;
        }

        DoorTransitionState.startHold(door);
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
        // if (this.keyMem.space) {
        //     this.player.applyImpulse(Vector2.UNIT_Y.mul(600));
        //     this.keyMem.space = false;
        // }

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

    private tickDoorTransition(dt: number) {
        const state = DoorTransitionState;

        if (state.phase === "holding") {
            const door = state.activeDoor;
            const stillInside = !!door && door.aabb.collidingWith(this.player.aabb);
            state.updateHold(dt, stillInside);
            this.doorTransitionActive = false;
        } else if (state.phase === "transition") {
            if (!this.doorTransitionActive) {
                this.prepareNextFloor();
                this.doorTransitionActive = true;
                this.clearAllKeys();
                this.joystickInput = Vector2.ZERO;
                this.shootingJoystickInput = Vector2.ZERO;
                this.player.vel = Vector2.ZERO;
            }
            state.tickTransition(dt, this.pendingMazeReady, () => this.completeDoorTransition());
        } else {

        }
    }

    private completeDoorTransition() {
        GameState.completeLevel();
        this.doorTransitionActive = false;

        if (GameState.isGameEnded) {
            return;
        }

        this.reset();
        GameState.focusGameCanvas();
    }

    updateCameraPos() {
        // TODO
        this.camera.x = this.player.x;
        this.camera.y = this.player.y;
    }

    currentTime = 0;
    deltaTime = 0;
    wasLastFramePaused = false; // Track pause state changes

    update(time: number) {
        // Check if pause state changed, clear keys if just got paused
        if (GameState.paused && !this.wasLastFramePaused) {
            this.clearAllKeys();
        }
        this.wasLastFramePaused = GameState.paused;
        this.deltaTime = (time - this.currentTime) / 1000;
        this.currentTime = time;

        // Skip game updates if paused or not in running phase, but continue the animation loop
        if (GameState.paused || !GameState.isGameRunning || this.deltaTime > 0.1) {
            this.currentTime = time;
            requestAnimationFrame(this.update.bind(this));
            return;
        }

        const isTransitioning = DoorTransitionState.phase === "transition";

        if (!isTransitioning) {
            this.updateCameraPos();
            this.updateEntities();
            this.resolveEntityCollisions();
        } else {
            this.player.vel = Vector2.ZERO;
            this.updateCameraPos();
        }

        this.effects.update(this.deltaTime);

        this.tickDoorTransition(this.deltaTime);

        this.render();

        requestAnimationFrame(this.update.bind(this));
    }

    resolveWallCollisions(entity: Entity) {
        const eCol = Math.floor(entity.x / CELL_SIZE);
        const eRow = Math.floor(entity.y / CELL_SIZE);

        // Add invisible walls
        if (this.currentRoomId > 0 && this.isRoomLocked(this.currentRoomId) && entity.metadata.entityType !== ENTITY_TYPE.projectile) {
            const room = this.idToRoomLayout[this.currentRoomId];
            if (room) {
                // Create invisible walls at room boundaries
                const roomLeft = room.left * CELL_SIZE;
                const roomRight = room.right * CELL_SIZE;
                const roomTop = room.top * CELL_SIZE;
                const roomBottom = room.bottom * CELL_SIZE;

                // Left boundary wall
                if (entity.x < roomLeft + entity.width / 2) {
                    entity.resolveCollision(AABB.fromPosSize(roomLeft - 10, roomTop, 10, roomBottom - roomTop));
                }
                // Right boundary wall
                if (entity.x > roomRight - entity.width / 2) {
                    entity.resolveCollision(AABB.fromPosSize(roomRight, roomTop, 10, roomBottom - roomTop));
                }
                // Top boundary wall
                if (entity.y < roomTop + entity.height / 2) {
                    entity.resolveCollision(AABB.fromPosSize(roomLeft, roomTop - 10, roomRight - roomLeft, 10));
                }
                // Bottom boundary wall
                if (entity.y > roomBottom - entity.height / 2) {
                    entity.resolveCollision(AABB.fromPosSize(roomLeft, roomBottom, roomRight - roomLeft, 10));
                }
            }
        }

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

        // Check for room completion after potential enemy kills
        if (this.currentRoomId > 0) {
            this.setRoomCompletionStatus(this.currentRoomId);
        }

    }
    /**
     * updates velocity of all entities and then move according to vel.
     */
    updateEntities() {
        // update player
        this.player.onMoveInput(this.getPlayerInput(), this.deltaTime);
        GameState.health = this.player.currentHealth;

        // Handle shooting input
        const shootDirection = this.getShootingInput();
        this.player.onShootInput(shootDirection, this);

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(this, this.deltaTime);

            // Remove if destroyed
            if (projectile.toBeDeleted) {
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
            room.entities = room.entities.filter(e => !e.toBeDeleted);
            room.dynamicEntities = room.dynamicEntities.filter(e => !e.toBeDeleted);

            this.setRoomCompletionStatus(this.currentRoomId);
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

    countEnemiesInRoom(roomId: number): number {
        if (roomId <= 0) return 0;

        const room = this.idToRoomLayout[roomId];
        if (!room) return 0;

        return room.entities.filter(entity =>
            entity.metadata.entityType === ENTITY_TYPE.enemy &&
            (!entity.toBeDeleted)
        ).length;
    }

    isRoomLocked(roomId: number): boolean {
        return roomId > 0 && !this.roomsCleared.get(roomId) && this.countEnemiesInRoom(roomId) > 0;
    }

    setRoomCompletionStatus(roomId: number): void {
        if (roomId <= 0) return;

        if (this.countEnemiesInRoom(roomId) === 0) {
            this.roomsCleared.set(roomId, true);
            if (roomId === 1) { // room 1 has door

                const roomLayout = this.idToRoomLayout[roomId];
                const doorX = roomLayout.doorLocation?.[1];
                const doorY = roomLayout.doorLocation?.[0];
                if (doorX !== undefined && doorY !== undefined) {
                    const entity = roomLayout.staticEntities[doorY][doorX];
                    if (entity && entity.metadata.entityType === ENTITY_TYPE.door) {
                        const doorEntity = entity as DoorEntity;
                        doorEntity.isLocked = false;
                    }
                }
            }
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
        let entitiesByDepth: Map<number, Entity[]> = new Map();
        // force scrolls/traps to render under players/enemies
        if (this.currentRoomId > 0) {
            currentRoomDynamicEntities = this.idToRoomLayout[this.currentRoomId].dynamicEntities;

            // Group entities by depth and apply priority sorting within each depth
            for (const entity of currentRoomDynamicEntities) {
                const entityBottom = entity.y + entity.height / 2;
                const depth = Math.floor(entityBottom / CELL_SIZE);

                if (!entitiesByDepth.has(depth)) {
                    entitiesByDepth.set(depth, []);
                }
                entitiesByDepth.get(depth)!.push(entity);
            }

            // Sort entities within each depth group by priority (traps/scrolls first)
            for (const [depth, entities] of entitiesByDepth) {
                entities.sort((a, b) => {
                    const aType = a.metadata?.entityType;
                    const bType = b.metadata?.entityType;

                    const aIsTrapOrScroll = aType === ENTITY_TYPE.trap || aType === ENTITY_TYPE.scroll;
                    const bIsTrapOrScroll = bType === ENTITY_TYPE.trap || bType === ENTITY_TYPE.scroll;

                    if (aIsTrapOrScroll && !bIsTrapOrScroll) return -1;
                    if (!aIsTrapOrScroll && bIsTrapOrScroll) return 1;

                    // Same priority, maintain stable order
                    return 0;
                });
            }
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
                                e.render(ctx, this.currentTime);
                            }
                        }
                    }
                }
            }

            // ====== DYNAMIC ENTITY ====== //
            const entitiesAtThisDepth = entitiesByDepth.get(row);
            if (entitiesAtThisDepth) {
                for (const entity of entitiesAtThisDepth) {
                    entity.render(ctx, this.currentTime);
                }
            }

            // ====== PROJECTILE SHADOWS ====== //
            for (const projectile of this.projectiles) {
                const shadowDepth = Math.floor(projectile.y / CELL_SIZE);
                if (shadowDepth === row) {
                    const col = Math.floor(projectile.x / CELL_SIZE);
                    if (col >= lowX && col < highX && 'renderShadow' in projectile) {
                        (projectile as any).renderShadow(ctx);
                    }
                }
            }


            // ====== PROJECTILES ====== //
            for (const projectile of this.projectiles) {
                // Calculate visual bottom position (where the projectile visually appears)
                const visualY = projectile.y - (projectile as any).height;
                const projectileDepth = Math.floor(visualY / CELL_SIZE);
                if (projectileDepth === row) {
                    const col = Math.floor(projectile.x / CELL_SIZE);
                    if (col >= lowX && col < highX) {
                        projectile.render(ctx, this.currentTime);
                    }
                }
            }

            // ====== PLAYER ====== //
            if (row === playerDepth) {
                this.player.render(ctx, this.currentTime);
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


        // ======= ROOM LOCK SCREEN OVERLAY ======

        const shouldShowOverlay = this.currentRoomId > 0 && this.isRoomLocked(this.currentRoomId);

        if (shouldShowOverlay !== this.lastOverlayState) {
            this.overlayTargetOpacity = shouldShowOverlay ? 1 : 0;
            this.lastOverlayState = shouldShowOverlay;
        }

        // Smoothly animate overlay opacity towards target
        if (this.overlayOpacity !== this.overlayTargetOpacity) {
            const diff = this.overlayTargetOpacity - this.overlayOpacity;
            this.overlayOpacity += diff * this.overlayTransitionSpeed / 60; //adjust 60 to fps if changed
            if (Math.abs(diff) < 0.01) {
                this.overlayOpacity = this.overlayTargetOpacity
            };
        }

        // Render overlay if it has any opacity
        if (this.overlayOpacity > 0 && this.currentRoomId > 0) {
            const currentRoom = this.idToRoomLayout[this.currentRoomId];
            if (currentRoom) {
                ctx.resetTransform();
                ctx.scale(dpr, dpr);

                const spacing = 0.3;
                const screenCenterX = (this.canvas.width / dpr) / (2 * this.zoom);
                const screenCenterY = (this.canvas.height / dpr) / (2 * this.zoom);
                const fadeDistance = (CELL_SIZE * this.zoom) * 0.5;
                const [screenWidth, screenHeight] = [this.canvas.width / dpr, this.canvas.height / dpr];
                const maxOpacity = 0.75 * this.overlayOpacity;

                // room screen boundaries
                const roomScreen = {
                    left: ((currentRoom.left - spacing) * CELL_SIZE - this.camera.x) * this.zoom + screenCenterX,
                    right: ((currentRoom.right + spacing) * CELL_SIZE - this.camera.x) * this.zoom + screenCenterX,
                    top: ((currentRoom.top - spacing) * CELL_SIZE - this.camera.y) * this.zoom + screenCenterY,
                    bottom: ((currentRoom.bottom + spacing - 0.3) * CELL_SIZE - this.camera.y) * this.zoom + screenCenterY
                };

                // rectangles with gradients
                const overlays = [
                    { condition: roomScreen.top > 0, gradient: [0, Math.max(0, roomScreen.top - fadeDistance), 0, roomScreen.top], stops: [maxOpacity, 0], rect: [0, 0, screenWidth, roomScreen.top] },
                    { condition: roomScreen.bottom < screenHeight, gradient: [0, roomScreen.bottom, 0, Math.min(screenHeight, roomScreen.bottom + fadeDistance)], stops: [0, maxOpacity], rect: [0, roomScreen.bottom, screenWidth, screenHeight - roomScreen.bottom] },
                    { condition: roomScreen.left > 0, gradient: [Math.max(0, roomScreen.left - fadeDistance), 0, roomScreen.left, 0], stops: [maxOpacity, 0], rect: [0, 0, roomScreen.left, screenHeight] },
                    { condition: roomScreen.right < screenWidth, gradient: [roomScreen.right, 0, Math.min(screenWidth, roomScreen.right + fadeDistance), 0], stops: [0, maxOpacity], rect: [roomScreen.right, 0, screenWidth - roomScreen.right, screenHeight] }
                ];

                overlays.forEach(({ condition, gradient, stops, rect }) => {
                    if (condition) {
                        const grad = ctx.createLinearGradient(gradient[0], gradient[1], gradient[2], gradient[3]);
                        grad.addColorStop(0, `rgba(0, 0, 0, ${stops[0]})`);
                        grad.addColorStop(1, `rgba(0, 0, 0, ${stops[1]})`);
                        ctx.fillStyle = grad;
                        ctx.fillRect(rect[0], rect[1], rect[2], rect[3]);
                    }
                });
            }
        }
    }
}



