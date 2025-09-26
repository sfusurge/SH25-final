<script lang="ts">
    import { global } from "$lib/../routes/+layout.svelte";
    import { GameState } from "$lib/components/maze/MazeGameState.svelte";
    import SlideShow from "$lib/components/shared/SlideShow.svelte";
    import { mazeGameConfig, createGameActionButton } from "$lib/components/shared/slideshowConfig";
    import MazeDoorOverlay from "./MazeDoorOverlay.svelte";
    import MazeHud from "./MazeHUD.svelte";

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
    <SlideShow
        slides={mazeGameConfig.instructions.slides}
        title={mazeGameConfig.instructions.title}
        show={true}
        actionButton={createGameActionButton(
            "start",
            () => {
                if (GameState.isGameRunning) {
                    GameState.showInstructionsDuringGame = false;
                    GameState.resumeGame();
                } else {
                    GameState.startGame();
                }
                GameState.focusGameCanvas();
            },
            GameState.isGameRunning
        )}
        showCloseButton={GameState.showCloseButtonInInstructions}
        onClose={() => {
            GameState.showInstructionsDuringGame = false;
            GameState.showCloseButtonInInstructions = false;
            GameState.resumeGame();
            GameState.focusGameCanvas();
        }}
        dataMazeUi={true}
    />
{/if}

{#if GameState.isGameEnded}
    <SlideShow
        slides={mazeGameConfig.ending.slides}
        title={mazeGameConfig.ending.title}
        show={true}
        showScore={GameState.score}
        gameResult={"win"}
        actionButton={createGameActionButton("restart", () => {
            // Reset the game world (new maze, entities, player position)
            if (gameRenderer) {
                gameRenderer.reset();
            }
            // Reset the game state (score, health, timer)
            GameState.startGame();
            GameState.focusGameCanvas();
        })}
        dataMazeUi={true}
    />
{/if}

<MazeHud />
<MazeDoorOverlay />

<style>
    .pause-overlay {
        position: absolute;
        inset: 0;
        background: rgba(128, 128, 128, 0.5);
        z-index: 200;
        pointer-events: all;
    }
</style>
