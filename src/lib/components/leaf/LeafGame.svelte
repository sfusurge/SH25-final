<script lang="ts">
	import Pause from "./Pause.svelte";
	import DesktopShop from "$lib/components/leaf/DesktopShop.svelte";
	import Frame from "$lib/components/leaf/Frame.svelte";
	import DesktopTimer from "./DesktopTimer.svelte";
	import DesktopScore from "./DesktopScore.svelte";
	import { global } from "../../../routes/+layout.svelte";
	import TopBar from "../landing/views/shared/TopBar.svelte";
	import HoverEffectButton from "../landing/HoverEffectButton.svelte";
	import { goto } from "$app/navigation";

	let showSettings = $state(false);
</script>

<div
	class="flex-1 flex flex-col h-full"
	style="max-height: 100dvh; overflow: hidden;"
>
	<!-- Mobile TopBar -->
	{#if global.mobile}
		<div class="mobile-topbar-container">
			<TopBar></TopBar>
		</div>
	{/if}

	<!-- Desktop layout -->
	{#if !global.mobile}
		<div class="flex justify-between items-start pt-8 px-8">
			<Pause />
			<DesktopShop />
		</div>
	{/if}

	<div
		class="flex-1 flex items-center justify-center"
		class:m-8={!global.mobile}
		class:mobile-frame-container={global.mobile}
		style="min-height: 0"
	>
		<Frame />
	</div>

	{#if !global.mobile}
		<div class="flex justify-center items-start pb-4 gap-8">
			<DesktopTimer />
			<DesktopScore />
		</div>
	{/if}
</div>

<style>
	.mobile-topbar-container {
		position: relative;
		z-index: 100;
		flex-shrink: 0;
	}

	.mobile-frame-container {
		margin: 0;
		padding: 0;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}
</style>
