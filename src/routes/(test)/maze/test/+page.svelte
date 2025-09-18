<script lang="ts">
    import MazeBackground from "$lib/components/maze/UI/MazeBackground.svelte";
    import ScalableFrame from "$lib/components/maze/UI/ScalableFrame.svelte";

    // Code
</script>

<div class="parent">
    <ScalableFrame style="height: 100%;">
        <MazeBackground />
    </ScalableFrame>
</div>

<style>
    .parent {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100dvh;
        padding: 5rem;

        justify-content: center;
    }
</style>
