import { writable, get } from 'svelte/store';

// Maze-specific stores and types
export const scoreStore = writable(0);
export const enemiesKilledStore = writable(0);
export const healthStore = writable(100);

export type GamePhase = 'pre' | 'running' | 'ended';
export const gamePhase = writable<GamePhase>('pre');
export const gameEndsAt = writable<number | null>(null);

// Game pause state
export const gamePaused = writable<boolean>(false);
export const pauseStartTime = writable<number | null>(null);
export const totalPauseTime = writable<number>(0);

export function pauseGame() {
    gamePaused.set(true);
    pauseStartTime.set(Date.now());
    if (game) {
        game.stopTimers();
    }
}

export function resumeGame() {
    const startTime = get(pauseStartTime);
    if (startTime) {
        const pauseDuration = Date.now() - startTime;
        totalPauseTime.update(total => total + pauseDuration);
        pauseStartTime.set(null);

        // Extend game session end time
        gameEndsAt.update(endsAt => endsAt ? endsAt + pauseDuration : null);
    }

    gamePaused.set(false);
    if (game) {
        game.startTimers();
    }
}

export function toggleGamePause() {
    const currentlyPaused = get(gamePaused);
    if (currentlyPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

// Instructions modal state and functions
export const showInstructionsDuringGame = writable<boolean>(false);

export function openInstructions() {
    showInstructionsDuringGame.set(true);
    pauseGame();
}

let gameCanvas: HTMLCanvasElement | null = null;

export function setGameCanvas(canvas: HTMLCanvasElement) {
    gameCanvas = canvas;
}

export function focusGameCanvas() {
    if (gameCanvas) {
        // ensure focus happens AFTER event cycle
        setTimeout(() => {
            gameCanvas?.focus();
        }, 0);
    }
}

export const nowStore = writable<number>(Date.now());

// Game timing constants
export const NOW_TICK_MS = 100;
export const GAME_DURATION_MS = 120_000; // 2 minutes

export class MazeGameController {
    private nowTimerId: number | undefined = undefined;

    constructor() {
        if (!this.nowTimerId) {
            this.nowTimerId = (setInterval(() => {
                if (!get(gamePaused)) {
                    nowStore.set(Date.now());
                    this.checkGameSessionEnd();
                }
            }, NOW_TICK_MS) as unknown) as number;
        }
    }

    // ---- Game session control ----
    startGame(): void {
        // Reset score
        scoreStore.set(0);
        enemiesKilledStore.set(0);
        healthStore.set(100);
        gamePaused.set(false);
        pauseStartTime.set(null);
        totalPauseTime.set(0);

        gamePhase.set('running');
        const ends = Date.now() + GAME_DURATION_MS;
        gameEndsAt.set(ends);
    }

    stopTimers(): void {
        if (this.nowTimerId) {
            clearInterval(this.nowTimerId);
            this.nowTimerId = undefined;
        }
    }

    startTimers(): void {
        // Restart now timer
        if (!this.nowTimerId) {
            this.nowTimerId = setInterval(() => {
                if (!get(gamePaused)) {
                    nowStore.set(Date.now());
                    this.checkGameSessionEnd();
                }
            }, NOW_TICK_MS) as unknown as number;
        }
    }

    private checkGameSessionEnd(): void {
        const phase = get(gamePhase);
        if (phase !== 'running') return;
        const endsAt = get(gameEndsAt);
        if (endsAt == null) return;
        if (Date.now() >= endsAt) {
            gamePhase.set('ended');
        }
    }
}

export const game = new MazeGameController();
