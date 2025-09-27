<script lang="ts">
    import DualTouchController from "./MazeJoysticks.svelte";
    import MazeGameUI from "./MazeGameUI.svelte";
    import MazePause from "./MazePause.svelte";
    import { global } from "../../../../routes/+layout.svelte";
    import { MazeBackgroundController } from "../MazeBackground.svelte.ts";
    import { GameState } from "$lib/components/maze/MazeGameState.svelte";
    import { tick } from "svelte";

    // Initialize the game controller
    const controller = new MazeBackgroundController();

    // Handle layout changes reactively to prevent canvas disappearing
    let previousLayout = $state({ mobile: global.mobile, medium: global.medium });
    let resizeTimeout: ReturnType<typeof setTimeout> | undefined;

    const runResizeSequence = () => {
        if (!controller.canvasContainer || !controller.canvas) return;

        controller.updateCanvasSize();
        requestAnimationFrame(() => controller.updateCanvasSize());
    };

    const scheduleResize = (delay = 0) => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }

        resizeTimeout = setTimeout(runResizeSequence, delay);
    };

    $effect(() => {
        // Detect layout changes
        const currentLayout = { mobile: global.mobile, medium: global.medium };
        const layoutChanged =
            currentLayout.mobile !== previousLayout.mobile ||
            currentLayout.medium !== previousLayout.medium;

        if (layoutChanged) {
            tick().then(() => {
                scheduleResize(0);
            });

            previousLayout = currentLayout;
        }
    });

    $effect(() => {
        const handleResize = () => {
            scheduleResize(60);
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("orientationchange", handleResize);
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
        };
    });
</script>

<div
    class="maze-root"
    class:mode-desktop={!global.mobile && !global.medium}
    class:mode-tablet={global.medium}
    class:mode-mobile={global.mobile}
>
    <div class="maze-stage">
        <div class="game-area">
            <div class="background">
                <div class="canvasContainer" bind:this={controller.canvasContainer}>
                    <canvas bind:this={controller.canvas} tabindex="0"></canvas>

                    {#if global.mobile && controller.showTouchController}
                        <DualTouchController
                            onMoveInput={controller.handleMoveInput}
                            onShootInput={controller.handleShootInput}
                            canvasElement={controller.canvasContainer}
                        />
                    {/if}
                </div>
            </div>

            <MazeGameUI gameRenderer={controller.gameRenderer} />

            {#if !global.mobile}
                <div
                    class="pause-button"
                    class:pointer-events-none={!GameState.isGameRunning ||
                        GameState.showInstructionsDuringGame}
                >
                    <MazePause />
                </div>
            {/if}
        </div>

        {#if !global.mobile}
            <img src="/assets/frame.svg" alt="" class="frame-overlay" loading="eager" />
        {/if}
    </div>
</div>

<style>
    .maze-root {
        flex: 1;
        width: 100%;
        height: 100%;
        max-height: 100dvh;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .maze-root.mode-mobile {
        align-items: stretch;
    }

    .maze-stage {
        position: relative;
        width: min(var(--stage-max-width, 100%), 100%);
        max-width: var(--stage-max-width, 100%);
        max-height: var(--stage-max-height, 100%);
        aspect-ratio: var(--stage-aspect, auto);
    }

    .maze-root.mode-desktop .maze-stage {
        --stage-max-width: min(85vh, 800px) * 1.744;
        --stage-max-height: min(85vh, 800px);
        --stage-aspect: 872 / 511;
    }

    .maze-root.mode-tablet .maze-stage {
        --stage-max-width: min(100vw - 2rem, 960px);
        --stage-max-height: 100%;
        --stage-aspect: 872 / 511;
    }

    .maze-root.mode-mobile .maze-stage {
        --stage-max-width: 100%;
        --stage-max-height: 100%;
    }

    .maze-root.mode-tablet {
        padding: 1.25rem 1rem;
        overflow: auto;
    }

    .game-area {
        position: absolute;
        inset: 0;
        overflow: hidden;
        z-index: 10;
    }

    .maze-root.mode-desktop .game-area {
        top: 2.87%;
        right: 2.87%;
        bottom: 2.87%;
        left: 2.87%;
    }

    .background {
        position: absolute;
        inset: 0;
        container-type: size;
        overflow: hidden;
        background: #000;
    }

    .canvasContainer {
        position: relative;
        display: block;
        width: 100%;
        height: 100%;
    }

    canvas {
        image-rendering: pixelated;
        width: 100%;
        height: 100%;
        display: block;
        background: #000;
    }

    canvas:focus {
        outline: none;
    }

    .frame-overlay {
        position: absolute;
        inset: 0;
        z-index: 30;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }

    .maze-root.mode-tablet .frame-overlay,
    .maze-root.mode-mobile .frame-overlay {
        display: none;
    }

    .pause-button {
        position: absolute;
        top: 0;
        left: 0;
        padding: 2rem 0 0 2rem;
        margin: 1.25rem;
        z-index: 400;
        pointer-events: auto;
    }

    .pause-button :global(.hidden) {
        display: flex !important;
    }

    .pause-button :global(.sm\:flex) {
        display: flex !important;
    }

    .maze-root.mode-tablet .pause-button {
        padding: 1.5rem 0 0 1.5rem;
        margin: 1rem;
    }

    .maze-root.mode-mobile .pause-button {
        display: none;
    }
</style>
