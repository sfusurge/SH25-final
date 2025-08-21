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
    <canvas width="500" height="500" bind:this={canvas} tabindex="0"></canvas>
</div>

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
    }

    canvas:focus {
        outline: none;
    }
</style>
