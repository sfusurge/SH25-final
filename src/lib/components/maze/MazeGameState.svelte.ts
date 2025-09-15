export const GamePhase = {
    PRE: 0,
    RUNNING: 1,
    ENDED: 2
} as const;

export type GamePhaseType = typeof GamePhase[keyof typeof GamePhase];

export const NOW_TICK_MS = 100;
export const GAME_DURATION_MS = 180_000; // 3 min

class _GameState {
    score = $state(0);
    enemiesKilled = $state(0);
    health = $state(100);
    phase = $state<GamePhaseType>(GamePhase.PRE);
    gameEndsAt = $state(-1);
    paused = $state(false);
    pauseStartTime = $state(-1);
    totalPauseTime = $state(0);
    showInstructionsDuringGame = $state(false);
    now = $state(Date.now());

    // Canvas management
    private gameCanvas: HTMLCanvasElement | null = null;

    // Timer management
    private nowTimerId: number | undefined = undefined;

    // Derived states
    isGameRunning = $derived(this.phase === GamePhase.RUNNING);
    isGameEnded = $derived(this.phase === GamePhase.ENDED);
    isGamePre = $derived(this.phase === GamePhase.PRE);
    timeRemaining = $derived.by(() => {
        if (this.isGameRunning && this.gameEndsAt >= 0) {
            return Math.max(0, this.gameEndsAt - this.now);
        }
        return this.isGameEnded ? 0 : GAME_DURATION_MS;
    });

    constructor() {
        // Initialize timer
        this.startTimers();

        $effect.root(() => {
            // ends game at health 0 or time ended
            $effect(() => {
                if (this.health <= 0 && this.phase === GamePhase.RUNNING) {
                    this.phase = GamePhase.ENDED;
                }
            });

            $effect(() => {
                if (this.isGameRunning && this.gameEndsAt >= 0 && this.now >= this.gameEndsAt) {
                    this.phase = GamePhase.ENDED;
                }
            });
        });
    }

    // Helper methods for state modification
    addScore(points: number): void {
        this.score += points;
    }

    reduceHealth(damage: number): void {
        this.health = Math.max(0, this.health - damage);
    }

    incrementEnemiesKilled(): void {
        this.enemiesKilled += 1;

        // TODO: adjust scoring values
        this.addScore(10);
    }

    resetStats(): void {
        this.score = 0;
        this.enemiesKilled = 0;
        this.health = 100;
    }

    startGame(): void {
        this.resetStats();
        this.paused = false;
        this.pauseStartTime = -1;
        this.totalPauseTime = 0;
        this.phase = GamePhase.RUNNING;
        this.gameEndsAt = Date.now() + GAME_DURATION_MS;
        this.startTimers();
    }

    openInstructions(): void {
        this.showInstructionsDuringGame = true;
        this.pauseGame();
    }

    updateNow(newTime: number): void {
        this.now = newTime;
    }

    // Canvas for outside click handling
    setGameCanvas(canvas: HTMLCanvasElement): void {
        this.gameCanvas = canvas;
    }

    focusGameCanvas(): void {
        if (this.gameCanvas) {
            // ensure focus happens AFTER event cycle
            setTimeout(() => {
                this.gameCanvas?.focus();
            }, 0);
        }
    }

    // Game pausing/resuming
    private startTimers(): void {
        if (!this.nowTimerId) {
            this.nowTimerId = setInterval(() => {
                if (!this.paused) {
                    this.updateNow(Date.now());
                }
            }, NOW_TICK_MS) as unknown as number;
        }
    }

    private stopTimers(): void {
        if (this.nowTimerId) {
            clearInterval(this.nowTimerId);
            this.nowTimerId = undefined;
        }
    }

    private canPause(): boolean {
        // Pause is only available when the pause button is visible
        return window.innerWidth >= 640;
    }

    pauseGame(): void {
        this.paused = true;
        this.pauseStartTime = Date.now();
        this.stopTimers();
    }

    resumeGame(): void {
        const startTime = this.pauseStartTime;
        if (startTime >= 0) {
            const pauseDuration = Date.now() - startTime;
            this.totalPauseTime += pauseDuration;
            this.pauseStartTime = -1;

            if (this.gameEndsAt >= 0) {
                this.gameEndsAt += pauseDuration;
            }
        }
        this.paused = false;
        this.startTimers();
    }

    togglePause(): void {
        // Only allow pause/unpause if pause controls are available
        if (!this.canPause() && !this.paused) {
            return; // Cannot pause when pause button is not visible
        }
        this.paused ? this.resumeGame() : this.pauseGame();
    }
}

export const GameState = new _GameState();