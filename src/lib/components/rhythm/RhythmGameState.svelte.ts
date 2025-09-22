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
    phase = $state<GamePhaseType>(GamePhase.PRE);
    paused = $state(false);
    showInstructionsDuringGame = $state(false);
    showCloseButtonInInstructions = $state(false);
    
    // Derived states
    isGameRunning = $derived(this.phase === GamePhase.RUNNING);
    isGameEnded = $derived(this.phase === GamePhase.ENDED);
    isGamePre = $derived(this.phase === GamePhase.PRE);


    constructor() {

        $effect.root(() => {
            // add condition to end game
            $effect(() => {

            });

        });
    }

    addScore(points: number): void {
        //TODO: to be modified
    }

    openInstructions(showCloseButton: boolean = false): void {
        this.showInstructionsDuringGame = true;
        this.showCloseButtonInInstructions = showCloseButton;
        this.pauseGame();
    }

    resetScore(): void {
        this.score = 0;
    }

    startGame(): void {
        this.resetScore();
        this.phase = GamePhase.RUNNING;
    }

    pauseGame(): void {
        this.paused = true;
    }

    resumeGame(): void {
        this.paused = false;
    }
}

export const GameState = new _GameState();