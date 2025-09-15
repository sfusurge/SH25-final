<script lang="ts">
    import DualTouchController from "$lib/components/maze/UI/MazeJoysticks.svelte";
    import MazeGameUI from "$lib/components/maze/UI/MazeGameUI.svelte";
    import { MazeBackgroundController } from "../MazeBackground.svelte.ts";

    // Initialize the controller
    const controller = new MazeBackgroundController();
</script>

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

    <!-- All UI overlays are now handled by MazeGameUI -->
    <MazeGameUI gameRenderer={controller.gameRenderer} />
</div>

<style>
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
