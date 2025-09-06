<script>

	import Sidebar from '$lib/components/landing/Sidebar/Sidebar.svelte';
	import AmbiancePlayer from '$lib/components/landing/Audio/AmbiancePlayer.svelte';
	import MainView from "$lib/components/landing/views/MainView.svelte";
	import { currentView } from '$lib/stores/currentView.js';
	import FAQ from "$lib/components/landing/views/FAQ.svelte";
	import SponsorsView from "$lib/components/landing/views/SponsorsView.svelte";
	import WebtoonView from "$lib/components/landing/views/WebtoonView.svelte";
	import LeafGame from "$lib/components/leaf/LeafGame.svelte";

</script>

<div class="font-catriel h-screen w-full relative overflow-x-hidden sm:overflow-hidden bg-[#0C0C0B]">
	<AmbiancePlayer />

	<!-- background tiling -->
	<div class="absolute inset-0 z-10 overflow-hidden">
		<div
				class="absolute
				bg-[length:82.5px_82.5px]
				bg-center
				bg-repeat
				w-[250%] h-[250%]
				left-[-50%] top-[-50%]
				rotate-45
				origin-center"
				style="background: url('/assets/pattern-element-buffer.svg')"
				data-demon="background"></div>
	</div>

	<div class="relative z-30 flex flex-col lg:flex-row h-full">
		<Sidebar/>
		{#if $currentView === 'home'}
			<MainView/>
		{:else if $currentView === 'garden'}
			<LeafGame />
		{:else if $currentView === 'partners'}
			<SponsorsView/>
		{:else if $currentView === 'FAQ'}
			<FAQ/>
		{:else if $currentView === 'webtoon-1'}
			<WebtoonView
					imageUrl="/backgrounds/fountain.webp"
			/>
		{:else}
			<MainView/>
		{/if}
	</div>
</div>

<style>
	:global(.font-catriel) {
		font-family: 'Catriel', sans-serif;
	}
</style>