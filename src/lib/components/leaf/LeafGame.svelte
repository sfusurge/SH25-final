<script lang="ts">
	import Background from './Background.svelte';
	import { isMobile } from '$lib/components/leaf/gameData/layout';
</script>

{#if $$props.mobile}
	<div class="relative w-full h-[75dvh]">
		<div id="leafGame" class:mobile={$isMobile}>
			<Background />
		</div>
	</div>
{:else}
	<div
			class="inset-0 relative"
			style="
          height: 100%;
          width: auto;
          max-width: 100%;
          object-fit: contain;
          display: flex;
          aspect-ratio: calc(872/511);
       "
	>
		<div
				style="
             position: absolute;
             left: 2.87%;
             top: 50%;
             width: calc(100% - (2 * 2.87%));
             aspect-ratio: calc(872/511);
             transform: translate(0, -50%);
             z-index: 3;
             display: flex;
             align-items: center;
             justify-content: center;
          "
		>
			<div id="leafGame" class:mobile={$isMobile}>
				<Background />
			</div>
		</div>

		<img
				src="/assets/frame.svg"
				alt="frame"
				class="object-contain absolute inset-0 pointer-events-none z-10 w-full h-full"
				loading="eager"
				data-demon="border"
		/>
	</div>
{/if}

<style>
	* {
		--leafGameHeight: 80vh;
	}

	#leafGame {
		width: calc(100vw - 2px);
		aspect-ratio: 19 / 8;
		height: auto;
		max-height: 100vh;
		border: 1px solid;
		overflow: visible;
		background: #1b3534;
	}

	#leafGame.mobile {
		aspect-ratio: 393 / 852;
		width: 100vw;
		height: auto;
		max-height: 100vh;
	}
</style>