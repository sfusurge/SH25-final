<script lang="ts">
    import { global } from "../../../../routes/+layout.svelte";
    import { GameState } from "$lib/components/maze/MazeGameState.svelte";
    import MazeInstructionsModal from "./MazeInstructionsModal.svelte";
    import MazeEndingModal from "./MazeEndingModal.svelte";
    import MazeDesktopTimer from "./MazeDesktopTimer.svelte";
    import MazeDesktopScore from "./MazeDesktopScore.svelte";
    import MazeMobileUI from "./MazeMobileUI.svelte";

    // Props
    interface Props {
        gameRenderer?: any; // MazeGame type would be imported from renderer
    }
    let { gameRenderer }: Props = $props();
</script>

{#if GameState.paused}
    <div class="pause-overlay" data-maze-ui></div>
{/if}

{#if GameState.isGamePre || GameState.showInstructionsDuringGame}
    <MazeInstructionsModal
        isRunning={GameState.isGameRunning}
        onStart={() => {
            if (GameState.isGameRunning) {
                GameState.showInstructionsDuringGame = false;
                GameState.resumeGame();
            } else {
                GameState.startGame();
            }
            GameState.focusGameCanvas();
        }}
    />
{/if}

{#if GameState.isGameEnded}
    <MazeEndingModal
        score={GameState.score}
        onRestart={() => {
            // Reset the game world (new maze, entities, player position)
            if (gameRenderer) {
                gameRenderer.reset();
            }
            // Reset the game state (score, health, timer)
            GameState.startGame();
            GameState.focusGameCanvas();
        }}
    />
{/if}

{#if !global.mobile}
    <div
        class="absolute bottom-0 left-1/2 -translate-x-1/2 z-[50] flex justify-center items-start pb-0 gap-8"
        class:pointer-events-none={GameState.isGamePre || GameState.showInstructionsDuringGame}
        data-maze-ui
    >
        <MazeDesktopTimer />
        <MazeDesktopScore />
    </div>
{/if}

{#if global.mobile}
    <MazeMobileUI />
{/if}

<style>
    .pause-overlay {
        position: absolute;
        inset: 0;
        background: rgba(128, 128, 128, 0.5);
        z-index: 200;
        pointer-events: all;
    }
</style>
