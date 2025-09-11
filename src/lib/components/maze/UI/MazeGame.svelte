<script lang="ts">
    import MazePause from "./MazePause.svelte";
    import MazeFrame from "$lib/components/maze/UI/MazeFrame.svelte";
    import { global } from "../../../../routes/+layout.svelte";
    import TopBar from "../../landing/views/shared/TopBar.svelte";

    let showSettings = $state(false);
</script>

<div class="flex-1 flex flex-col h-full" style="max-height: 100dvh; overflow: hidden;">
    <!-- Mobile TopBar -->
    <!-- {#if global.mobile}
		<div class="mobile-topbar-container">
			<TopBar></TopBar>
		</div>
	{/if} -->

    <div
        class="flex-1 flex items-center justify-center"
        class:m-8={!global.mobile}
        class:mobile-frame-container={global.mobile}
        style="min-height: 0"
    >
        <MazeFrame />
    </div>

    <!-- {#if !global.mobile}
		<div class="flex justify-center items-start pb-4 gap-8">
			<DesktopTimer />
			<DesktopScore />
		</div>
	{/if} -->
</div>

<style>
    .mobile-frame-container {
        margin: 0;
        padding: 0;
        flex: 1;
        min-height: 0;
        overflow: hidden;
    }
</style>
