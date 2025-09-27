export const GamePhase = {
    PRE: 0,
    RUNNING: 1,
    ENDED: 2
} as const;

export type GamePhaseType = typeof GamePhase[keyof typeof GamePhase];

export const NOW_TICK_MS = 100;
export const MAX_LEVELS = 5;

export const GameResult = {
    WIN: "win",
    LOSE: "lose"
} as const;

export type GameResultType = typeof GameResult[keyof typeof GameResult];

export function formatDuration(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
}

class _GameState {
    score = $state(0);
    enemiesKilled = $state(0);
    health = $state(100);
    phase = $state<GamePhaseType>(GamePhase.PRE);
    gameStartTime = $state(-1);
    finalElapsedTime = $state(0);
    paused = $state(false);
    pauseStartTime = $state(-1);
    totalPauseTime = $state(0);
    showInstructionsDuringGame = $state(false);
    showCloseButtonInInstructions = $state(false);
    now = $state(Date.now());
    levelsCompleted = $state(0);
    gameResult = $state<GameResultType | null>(null);
    timerFreezeStart = $state(-1);
    totalTimerFreezeTime = $state(0);

    currentLevel = $derived(Math.min(MAX_LEVELS, this.levelsCompleted + 1));
    timeElapsedMs = $derived.by(() => {
        if (this.gameStartTime < 0) {
            return 0;
        }

        if (this.phase === GamePhase.ENDED) {
            return this.finalElapsedTime;
        }

        return this.computeElapsed(this.now);
    });
    formattedElapsedTime = $derived(formatDuration(this.timeElapsedMs));

    // Canvas management
    private gameCanvas: HTMLCanvasElement | null = null;

    // Timer management
    private nowTimerId: number | undefined = undefined;

    // Derived states
    isGameRunning = $derived(this.phase === GamePhase.RUNNING);
    isGameEnded = $derived(this.phase === GamePhase.ENDED);
    isGamePre = $derived(this.phase === GamePhase.PRE);

    constructor() {
        this.paused = true;
        this.startTimers();
        $effect.root(() => {
            // ends game at health 0 or time ended
            $effect(() => {
                if (this.health <= 0 && this.phase === GamePhase.RUNNING) {
                    this.endGame(GameResult.LOSE);
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
        this.levelsCompleted = 0;
        this.gameResult = null;
        this.totalTimerFreezeTime = 0;
        this.timerFreezeStart = -1;
    }

    startGame(): void {
        this.resetStats();
        this.paused = false;
        this.pauseStartTime = -1;
        this.totalPauseTime = 0;
        this.showInstructionsDuringGame = false;
        this.showCloseButtonInInstructions = false;
        this.phase = GamePhase.RUNNING;
        const startTime = Date.now();
        this.gameStartTime = startTime;
        this.finalElapsedTime = 0;
        this.now = startTime;
        this.startTimers();
    }

    openInstructions(showCloseButton: boolean = false): void {
        this.showInstructionsDuringGame = true;
        this.showCloseButtonInInstructions = showCloseButton;
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
    // (NOT FOR TRANSITION TIMER PAUSING, PAUSES THE WHOLE GAME, see below for that)
    startTimers(): void {
        if (!this.nowTimerId) {
            this.nowTimerId = setInterval(() => {
                if (!this.paused) {
                    this.updateNow(Date.now());
                }
            }, NOW_TICK_MS) as unknown as number;
        }
    }

    stopTimers(): void {
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
        if (this.phase !== GamePhase.RUNNING || this.paused) {
            return;
        }
        this.paused = true;
        this.pauseStartTime = Date.now();
        this.stopTimers();
    }

    resumeGame(): void {
        if (this.phase !== GamePhase.RUNNING || !this.paused) {
            return;
        }
        const startTime = this.pauseStartTime;
        if (startTime >= 0) {
            const pauseDuration = Date.now() - startTime;
            this.totalPauseTime += pauseDuration;
            this.pauseStartTime = -1;
        }
        this.paused = false;
        this.startTimers();
    }

    togglePause(): void {
        if (this.phase !== GamePhase.RUNNING) {
            return;
        }
        // Only allow pause/unpause if pause controls are available
        if (!this.canPause() && !this.paused) {
            return; // Cannot pause when pause button is not visible
        }
        this.paused ? this.resumeGame() : this.pauseGame();
    }

    completeLevel(): void {
        if (this.phase !== GamePhase.RUNNING) {
            return;
        }
        this.levelsCompleted += 1;
        if (this.levelsCompleted >= MAX_LEVELS) {
            this.endGame(GameResult.WIN);
        }
    }

    endGame(result: GameResultType): void {
        if (this.phase === GamePhase.ENDED) {
            return;
        }

        if (this.pauseStartTime >= 0 && this.paused) {
            this.totalPauseTime += Date.now() - this.pauseStartTime;
            this.pauseStartTime = -1;
        }

        if (this.timerFreezeStart >= 0) {
            this.totalTimerFreezeTime += Date.now() - this.timerFreezeStart;
            this.timerFreezeStart = -1;
        }

        const endTime = Date.now();
        this.now = endTime;
        this.finalElapsedTime = this.computeElapsed(endTime);

        this.phase = GamePhase.ENDED;
        this.gameResult = result;
        this.paused = true;
        this.pauseStartTime = -1;
        this.showInstructionsDuringGame = false;
        this.showCloseButtonInInstructions = false;
        this.stopTimers();
    }

    private computeElapsed(atTime: number): number {
        if (this.gameStartTime < 0) {
            return 0;
        }

        let totalTime = this.totalPauseTime + this.totalTimerFreezeTime;
        if (this.pauseStartTime >= 0 && this.paused) {
            totalTime += Math.max(0, atTime - this.pauseStartTime);
        }

        if (this.timerFreezeStart >= 0) {
            totalTime += Math.max(0, atTime - this.timerFreezeStart);
        }

        return Math.max(0, atTime - this.gameStartTime - totalTime);
    }

    // for between-level transitions
    freezeTimer(): void {
        if (this.timerFreezeStart >= 0 || this.phase !== GamePhase.RUNNING) {
            return;
        }
        this.timerFreezeStart = Date.now();
    }

    resumeTimer(): void {
        if (this.timerFreezeStart < 0) {
            return;
        }
        this.totalTimerFreezeTime += Date.now() - this.timerFreezeStart;
        this.timerFreezeStart = -1;
    }
}

export const GameState = new _GameState();
