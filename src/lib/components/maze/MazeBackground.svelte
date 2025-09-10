<script lang="ts">
    import { debug, MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";
    import DualTouchController from "$lib/components/maze/DualTouchController.svelte";
    import type { Vector2 } from "$lib/Vector2";
    import { onDestroy, onMount } from "svelte";
    import { global } from "../../../routes/+layout.svelte";
    import {
        gamePhase,
        gameEndsAt,
        scoreStore,
        gamePaused,
        showInstructionsDuringGame,
        resumeGame,
        nowStore,
        GAME_DURATION_MS,
        setGameCanvas,
        focusGameCanvas,
        pauseGame,
    } from "$lib/components/maze/gameData/MazeGameData";
    import { derived } from "svelte/store";
    import MazeInstructionsModal from "./MazeInstructionsModal.svelte";
    import MazeEndingModal from "./MazeEndingModal.svelte";
    import MazeDesktopTimer from "./MazeDesktopTimer.svelte";
    import MazeDesktopScore from "./MazeDesktopScore.svelte";
    import MazeMobileUI from "./MazeMobileUI.svelte";
    import { game } from "$lib/components/maze/gameData/MazeGameData";

    let canvas: HTMLCanvasElement | undefined = $state();
    let canvasContainer: HTMLDivElement | undefined = $state();

    let gameController: MazeGame | undefined = $state();

    // Make canvas responsive
    let canvasWidth = $state(600);
    let canvasHeight = $state(600);

    let cleanupClickListener: (() => void) | undefined;

    onMount(() => {
        if (canvas && canvasContainer) {
            // Set up ResizeObserver to handle container size changes
            const resizeObserver = new ResizeObserver(() => {
                updateCanvasSize();
            });
            resizeObserver.observe(canvasContainer);

            // Set up window resize listener
            window.addEventListener("resize", updateCanvasSize);

            // pause game on outside click
            const handleOutsideClick = (event: MouseEvent) => {

                if ($gamePhase !== "running" || $gamePaused) {
                    return;
                }

                const target = event.target as Element;

                // Don't pause if clicking on the canvas, UI elements
                if (target === canvas) {
                    return;
                }

                if (
                    // is there a better way lol
                    target.closest("button") ||
                    target.closest(".modal") ||
                    target.closest(".modal-backdrop") ||
                    target.closest('[role="button"]') ||
                    target.closest("input") ||
                    target.closest("select") ||
                    target.closest(".hud") ||
                    target.closest(".nav-btn") ||
                    target.closest(".start-btn") ||
                    target.closest(".restart-btn") ||

                    //mobile
                    target.closest(".joystick-container") ||
                    target.closest(".touch-controller") ||
                    target.closest(".touch-overlay") ||
                    target.closest(".joystick") ||
                    target.closest(".joystick-base") ||
                    target.closest(".joystick-knob")
                ) {
                    return;
                }

                // Pause the game for clicks outside the canvas and UI
                pauseGame();
            };

            document.addEventListener("click", handleOutsideClick);

            // Store cleanup function
            cleanupClickListener = () => {
                document.removeEventListener("click", handleOutsideClick);
            };

            // Initial canvas sizing (wait for next tick to ensure DOM is ready)
            setTimeout(() => {
                updateCanvasSize();

                // Initialize game controller after canvas is properly sized
                if (canvas) {
                    gameController = new MazeGame(canvas);
                    setGameCanvas(canvas);
                }
            }, 0);
        }
    });

    onDestroy(() => {
        // TODO destroy MazeGame controller and unmount all related event listners.
        window.removeEventListener("resize", updateCanvasSize);

        if (cleanupClickListener) {
            cleanupClickListener();
        }
    });

    function updateCanvasSize() {
        if (!canvasContainer || !canvas) return;

        // Get the actual display size of the container
        const containerRect = canvasContainer.getBoundingClientRect();
        const displayWidth = containerRect.width;
        const displayHeight = containerRect.height;

        // Use device pixel ratio for sharp rendering on high-DPI displays
        const dpr = window.devicePixelRatio || 1;

        // Set the internal canvas resolution (accounts for device pixel ratio)
        const internalWidth = displayWidth * dpr;
        const internalHeight = displayHeight * dpr;

        // Update our state variables
        canvasWidth = internalWidth;
        canvasHeight = internalHeight;

        // Set the canvas internal resolution
        canvas.width = internalWidth;
        canvas.height = internalHeight;

        // Scale the canvas back down using CSS to account for device pixel ratio
        canvas.style.width = displayWidth + "px";
        canvas.style.height = displayHeight + "px";

        // Notify the game controller about the size change
        if (gameController) {
            gameController.handleCanvasResize(internalWidth, internalHeight);
        }
    }

    function handleMoveInput(input: Vector2) {
        if (gameController) {
            gameController.setJoystickInput(input);
        }
    }

    function handleShootInput(input: Vector2) {
        if (gameController) {
            gameController.setShootingJoystickInput(input);
        }
    }

    // Global session countdown text (MM:SS)
    let sessionTimeLeftMs = $derived(
        $gamePhase === "running" && $gameEndsAt
            ? Math.max(0, $gameEndsAt - $nowStore)
            : $gamePhase === "ended"
              ? 0
              : GAME_DURATION_MS
    );
    function fmt(ms: number) {
        const s = Math.floor(ms / 1000);
        const mm = String(Math.floor(s / 60)).padStart(2, "0");
        const ss = String(s % 60).padStart(2, "0");
        return `${mm}:${ss}`;
    }
</script>

<div class="background">
    <div class="canvasContainer" bind:this={canvasContainer}>
        <canvas bind:this={canvas} tabindex="0"></canvas>
        {#if gameController && gameController.mobileMode}
            <DualTouchController
                onMoveInput={handleMoveInput}
                onShootInput={handleShootInput}
                canvasElement={canvasContainer}
            />
        {/if}
    </div>

    {#if $gamePaused}
        <div class="pause-overlay"></div>
    {/if}

    {#if $gamePhase === "pre" || $showInstructionsDuringGame}
        <MazeInstructionsModal
            isRunning={$gamePhase === "running"}
            onStart={() => {
                if ($gamePhase === "running") {
                    showInstructionsDuringGame.set(false);
                    resumeGame();
                } else {
                    game.startGame();
                }
                focusGameCanvas();
            }}
        />
    {/if}

    {#if $gamePhase === "ended"}
        <MazeEndingModal
            score={$scoreStore}
            onRestart={() => {
                // Reset the game world (new maze, entities, player position)
                if (gameController) {
                    gameController.reset();
                }
                // Reset the game state (score, health, timer)
                game.startGame();
                focusGameCanvas();
            }}
        />
    {/if}

    {#if !global.mobile}
        <div
            class="absolute bottom-0 left-1/2 -translate-x-1/2 z-[50] flex justify-center items-start pb-0 gap-8"
            class:pointer-events-none={$gamePhase === "pre" || $showInstructionsDuringGame}
        >
            <MazeDesktopTimer />
            <MazeDesktopScore />
        </div>
    {/if}

    {#if global.mobile}
        <MazeMobileUI />
    {/if}
</div>

<style>
    * {
        --mazeGameHeight: 80vh;
    }

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

    .pause-overlay {
        position: absolute;
        inset: 0;
        background: rgba(128, 128, 128, 0.5);
        z-index: 200;
        pointer-events: all;
    }
</style>
