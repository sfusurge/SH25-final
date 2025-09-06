<script lang="ts">
	import Background from "./Background.svelte";
	import { isMobile } from "$lib/components/leaf/gameData/layout";
</script>

{#if $$props.mobile}
	<div class="relative w-full h-[75dvh]">
		<div id="leafGame" class:mobile={$isMobile}>
			<Background />
		</div>
	</div>
{:else}
	<div id="leafGame" class:mobile={$isMobile}>
		<Background />
	</div>
{/if}

<style>
	* {
		--leafGameHeight: 80vh;
	}

	#leafGame {
		width: 100%;
		height: 100%;
		aspect-ratio: calc(872 / 511);
		border: 1px solid;
		overflow: hidden;
		background: #1b3534;
	}

	#leafGame.mobile {
		aspect-ratio: 393 / 852;
		width: 100vw;
		height: auto;
		max-height: 100vh;
	}
</style>
