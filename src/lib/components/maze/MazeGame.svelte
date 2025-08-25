<script lang="ts">
    import { debug, MazeGame } from "$lib/components/maze/MazeGame.svelte.ts";
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
</script>

<div class="canvasContainer">
    <canvas width="600" height="600" bind:this={canvas} tabindex="0"></canvas>
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
    canvas {
        border: 5px solid green;
        image-rendering: crisp-edges;
    }

    canvas:focus {
        outline: none;
    }
</style>
