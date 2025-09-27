import type { DoorEntity } from "./entities/DoorEntity";
import { GameState } from "./MazeGameState.svelte";

export type DoorTransitionPhase = "idle" | "holding" | "transition";

const DEFAULT_PROMPT_TITLE = "Hold to enter";
const DEFAULT_PROMPT_CANCEL = "Move away to stay in this floor";
const TRANSITION_PREPARING_MESSAGE = "Preparing the next floor...";
const TRANSITION_READY_MESSAGE = "Preparing the next floor...";

class _DoorTransitionState {
    phase = $state<DoorTransitionPhase>("idle");
    activeDoor: DoorEntity | null = null;

    promptTitle = $state(DEFAULT_PROMPT_TITLE);
    promptCancel = $state(DEFAULT_PROMPT_CANCEL);
    transitionMessage = $state(TRANSITION_PREPARING_MESSAGE);

    holdTimer = $state(0);
    holdDuration = 1.5; // seconds player must remain in doorway

    transitionTimer = $state(0);
    readyTimer = $state(0);
    minimumReadyDuration = 0.5; // seconds to display ready state before completion
    isReady = $state(false);

    private setDefaultPrompts() {
        this.promptTitle = DEFAULT_PROMPT_TITLE;
        this.promptCancel = DEFAULT_PROMPT_CANCEL;
        this.transitionMessage = TRANSITION_PREPARING_MESSAGE;
    }

    startHold(door: DoorEntity) {
        if (this.phase === "transition") {
            return;
        }
        if (this.activeDoor === door && this.phase === "holding") {
            return;
        }

        this.activeDoor = door;
        this.phase = "holding";
        this.holdTimer = 0;
        this.transitionTimer = 0;
        this.readyTimer = 0;
        this.isReady = false;
        this.transitionMessage = TRANSITION_PREPARING_MESSAGE;
    }

    cancelHold() {
        if (this.phase !== "holding") {
            return;
        }
        this.phase = "idle";
        this.activeDoor = null;
        this.holdTimer = 0;
        this.transitionTimer = 0;
        this.setDefaultPrompts();
    }

    updateHold(dt: number, stillInside: boolean) {
        if (this.phase !== "holding") {
            return;
        }

        if (!stillInside) {
            this.cancelHold();
            return;
        }

        this.holdTimer = Math.min(this.holdDuration, this.holdTimer + dt);
        if (this.holdTimer >= this.holdDuration) {
            this.startTransition();
        }
    }

    startTransition() {
        if (!this.activeDoor) {
            return;
        }

        this.phase = "transition";
        this.transitionTimer = 0;
        this.readyTimer = 0;
        this.isReady = false;
        this.transitionMessage = TRANSITION_PREPARING_MESSAGE;
        GameState.freezeTimer();
    }

    markTransitionReady(message?: string) {
        if (!this.isReady) {
            this.isReady = true;
            this.readyTimer = 0;
            if (message) {
                this.transitionMessage = message;
            } else {
                this.transitionMessage = TRANSITION_READY_MESSAGE;
            }
        }
    }

    tickTransition(dt: number, isReady: boolean, onTransitionComplete?: () => void) {
        if (this.phase !== "transition") {
            return;
        }

        this.transitionTimer += dt;

        if (isReady) {
            this.markTransitionReady();
        }

        if (this.isReady) {
            this.readyTimer += dt;
        }

        if (this.isReady && this.readyTimer >= this.minimumReadyDuration) {
            onTransitionComplete?.();
            this.reset();
        }
    }

    reset() {
        this.phase = "idle";
        this.activeDoor = null;
        this.holdTimer = 0;
        this.transitionTimer = 0;
        this.readyTimer = 0;
        this.isReady = false;
        this.setDefaultPrompts();
        GameState.resumeTimer();
    }

    get holdProgress() {
        if (this.phase !== "holding") {
            return 0;
        }
        return Math.min(1, this.holdTimer / this.holdDuration);
    }

    get transitionProgress() {
        if (this.phase !== "transition") {
            return 0;
        }
        if (!this.isReady) {
            return 0;
        }
        return Math.min(1, this.readyTimer / this.minimumReadyDuration);
    }
}

export const DoorTransitionState = new _DoorTransitionState();
