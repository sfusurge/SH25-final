<!-- @migration-task Error while migrating Svelte code: Can only bind to an Identifier or MemberExpression or a `{get, set}` pair
https://svelte.dev/e/bind_invalid_expression -->
<script lang="ts">
    import { debug, MazeGame } from "$lib/components/maze/MazeGame.svelte.ts";
    import MobileJoystick from "$lib/components/maze/MobileJoystick.svelte";
    import type { Vector2 } from "$lib/Vector2";
    import { onDestroy, onMount } from "svelte";

    let canvas: HTMLCanvasElement | undefined = $state();
    let canvasContainer: HTMLDivElement | undefined = $state();

    let gameController: MazeGame | undefined = $state();

    // Make canvas responsive
    let canvasWidth = $state(600);
    let canvasHeight = $state(600);

    onMount(() => {
        if (canvas && canvasContainer) {
            // Set up ResizeObserver to handle container size changes
            const resizeObserver = new ResizeObserver(() => {
                updateCanvasSize();
            });
            resizeObserver.observe(canvasContainer);

            // Set up window resize listener
            window.addEventListener("resize", updateCanvasSize);

            // Initial canvas sizing (wait for next tick to ensure DOM is ready)
            setTimeout(() => {
                updateCanvasSize();

                // Initialize game controller after canvas is properly sized
                if (canvas) {
                    gameController = new MazeGame(canvas);
                }
            }, 0);
        }
    });

    onDestroy(() => {
        // TODO destroy MazeGame controller and unmount all related event listners.
        window.removeEventListener("resize", updateCanvasSize);
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

    function handleJoystickMove(input: Vector2) {
        if (gameController) {
            gameController.setJoystickInput(input);
        }
    }

    function handleShootingJoystick(input: Vector2) {
        if (gameController) {
            gameController.setShootingJoystickInput(input);
        }
    }
</script>

<div class="canvasContainer" bind:this={canvasContainer}>
    <canvas bind:this={canvas} tabindex="0"></canvas>
    {#if gameController && gameController.mobileMode}
        <div class="mobile-controls-left">
            <MobileJoystick onmove={handleJoystickMove} position="left" />
        </div>
        <div class="mobile-controls-right">
            <MobileJoystick onmove={handleShootingJoystick} position="right" />
        </div>
    {/if}
</div>

{#if gameController}
    <input type="range" step="any" min="0.2" max="2" bind:value={gameController!.zoom} />
{/if}

<div>
    Debug:
    <pre>
        <code>
{JSON.stringify(debug, undefined, 4)}
        </code>
    </pre>
</div>

<style>
    .canvasContainer {
        position: relative;
        display: block;
        width: 100%;
        max-width: min(90vw, 90vh, 800px);
        aspect-ratio: 1;
        margin: 0 auto;
    }

    canvas {
        border: 5px solid green;
        image-rendering: pixelated; /* Better for pixel art games */
        width: 100%;
        height: 100%;
        display: block;
    }

    canvas:focus {
        outline: none;
    }

    .mobile-controls-left {
        position: absolute;
        bottom: 10px;
        left: 10px;
        z-index: 1000;
        pointer-events: auto;
    }

    .mobile-controls-right {
        position: absolute;
        bottom: 10px;
        right: 10px;
        z-index: 1000;
        pointer-events: auto;
    }
</style>
