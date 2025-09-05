<!-- @migration-task Error while migrating Svelte code: Can only bind to an Identifier or MemberExpression or a `{get, set}` pair
https://svelte.dev/e/bind_invalid_expression -->
<script lang="ts">
    import { debug, MazeGame } from "$lib/components/maze/MazeGame.svelte.ts";
    import MobileJoystick from "$lib/components/maze/MobileJoystick.svelte";
    import type { Vector2 } from "$lib/Vector2";
    import { onDestroy, onMount } from "svelte";

    let canvas: HTMLCanvasElement | undefined = $state();

    let gameController: MazeGame | undefined = $state();

    onMount(() => {
        if (canvas) {
            // canvas should be mounted by now...
            gameController = new MazeGame(canvas);
        }
    });

    onDestroy(() => {
        // TODO destroy MazeGame controller and unmount all related event listners.
    });

    function handleJoystickMove(input: Vector2) {
        if (gameController) {
            gameController.setJoystickInput(input);
        }
    }
</script>

<div class="canvasContainer">
    <canvas width="600" height="600" bind:this={canvas} tabindex="0"> </canvas>
    {#if gameController && gameController.mobileMode}
        <div class="mobile-controls">
            <MobileJoystick onmove={handleJoystickMove} />
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
        display: inline-block;
    }

    canvas {
        border: 5px solid green;
        image-rendering: "smooth";

        /* will have to change */
        max-width: 80vw;
    }

    canvas:focus {
        outline: none;
    }

    .mobile-controls {
        position: absolute;
        bottom: 20px;
        left: 20px;
        z-index: 1000;
        pointer-events: auto;
    }
</style>
