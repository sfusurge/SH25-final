<script lang="ts">
    import DualTouchController from "./MazeJoysticks.svelte";
    import MazeGameUI from "./MazeGameUI.svelte";
    import MazePause from "./MazePause.svelte";
    import { global } from "../../../../routes/+layout.svelte";
    import { MazeBackgroundController } from "../MazeBackground.svelte.ts";
    import { GameState } from "$lib/components/maze/MazeGameState.svelte";

    // Initialize the game controller
    const controller = new MazeBackgroundController();
</script>

<div class="flex-1 flex flex-col h-full" style="max-height: 100dvh; overflow: hidden;">
    <div
        class="flex-1 flex items-center justify-center"
        class:m-8={!global.mobile}
        class:mobile-frame-container={global.mobile}
        style="min-height: 0"
    >
        {#if !global.mobile}
            <!-- Desktop: Frame container with border frame -->
            <div class="relative w-screen h-screen grid place-items-center">
                <div class="frame-container">
                    <!-- Game canvas area with inset for frame -->
                    <div
                        class="absolute z-10 overflow-hidden game-area"
                        style="
                            top: var(--inset-top, 2.87%);
                            right: var(--inset-right, 2.87%);
                            bottom: var(--inset-bottom, 2.87%);
                            left: var(--inset-left, 2.87%);
                        "
                    >
                        <div class="background">
                            <div class="canvasContainer" bind:this={controller.canvasContainer}>
                                <canvas bind:this={controller.canvas} tabindex="0"></canvas>
                            </div>
                        </div>

                        <!-- UI, make it inside the frame -->
                        <MazeGameUI gameRenderer={controller.gameRenderer} />
                    </div>

                    <!-- Frame image overlay -->
                    <img
                        src="/assets/frame.svg"
                        alt=""
                        class="absolute inset-0 z-30 w-full h-full pointer-events-none"
                        loading="eager"
                    />

                    <!-- Pause button, large screen only -->
                    <div
                        class="absolute top-0 left-0 z-10 pt-8 px-8 m-5"
                        class:pointer-events-none={!GameState.isGameRunning ||
                            GameState.showInstructionsDuringGame}
                    >
                        <MazePause />
                    </div>
                </div>
            </div>
        {:else}
            <!-- Mobile: Full screen background -->
            <div class="mobile-background-container">
                <div class="background">
                    <div class="canvasContainer" bind:this={controller.canvasContainer}>
                        <canvas bind:this={controller.canvas} tabindex="0"></canvas>
                        {#if controller.showTouchController}
                            <DualTouchController
                                onMoveInput={controller.handleMoveInput}
                                onShootInput={controller.handleShootInput}
                                canvasElement={controller.canvasContainer}
                            />
                        {/if}
                    </div>
                </div>

                <!-- UI overlays for mobile -->
                <MazeGameUI gameRenderer={controller.gameRenderer} />
            </div>
        {/if}
    </div>
</div>

<style>
    .mobile-frame-container {
        margin: 0;
        padding: 0;
        flex: 1;
        min-height: 0;
        overflow: hidden;
    }

    /* Desktop frame styling */
    .frame-container {
        /* Match MainView Frame sizing exactly for desktop */
        position: relative;
        height: 80%;
        width: auto;
        max-width: 100%;
        aspect-ratio: 872 / 511;
    }

    /* Responsive adjustments for smaller screens */
    @media (max-width: 1240px) {
        .frame-container {
            /* At 1240px and below, fill the entire width of the screen */
            width: 100%;
            height: auto;
            min-height: 350px;
            min-width: unset;
        }
    }

    @media (max-width: 768px) {
        .frame-container {
            /* Mobile adjustments */
            min-height: 300px;
            min-width: 525px; /* 300 * (872/511) */
        }
    }

    @media (max-width: 640px) {
        .frame-container {
            /* Small mobile adjustments */
            width: 100%;
            height: auto;
            min-height: 250px;
            min-width: unset;
        }
    }

    .mobile-background-container {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
    }

    /* Game canvas styling */
    .background {
        position: absolute; /* fill the parent area */
        inset: 0;
        container-type: size;
        overflow: hidden;
        background: #000; /* Dark background for maze */
    }

    .canvasContainer {
        position: relative;
        display: block;
        width: 100%;
        height: 100%;
    }

    canvas {
        image-rendering: pixelated; /* Better for pixel art games */
        width: 100%;
        height: 100%;
        display: block;
        background: #000;
    }

    canvas:focus {
        outline: none;
    }
</style>
