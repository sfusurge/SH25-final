<script>

	import Sidebar from '$lib/components/landing/Sidebar/Sidebar.svelte';
	import Frame from '$lib/components/landing/Frame.svelte';
	import CurrentBackgroundMobile from '$lib/components/landing/CurrentBackgroundMobile.svelte';
	import Controls from '$lib/components/landing/Audio/MusicPlayer.svelte';
	import CurrentTrackInfo from '$lib/components/landing/CurrentTrackInfo.svelte';
	import Timer from '$lib/components/landing/Timer/Timer.svelte';
	import TimerDisplay from '$lib/components/landing/Timer/TimerDisplay.svelte';
	import SwapBackground from '$lib/components/landing/SwapBackground.svelte';
	import HoverEffectButton from '$lib/components/landing/Audio/ScrollingText.svelte';
	import AmbiancePlayer from '$lib/components/landing/Audio/AmbiancePlayer.svelte';
	import TimerDialog from '$lib/components/landing/Timer/TimerDialog.svelte';
	import { currentBackgroundIndex, backgrounds } from '$lib/stores/background.js';

	import MainView from "$lib/components/landing/views/MainView.svelte";

	let showSettings = false;

	$: currentBackground = backgrounds[$currentBackgroundIndex];

	function onChangeBackground() {
		const nextIndex = ($currentBackgroundIndex + 1) % backgrounds.length;
		currentBackgroundIndex.set(nextIndex);
	}

	function toggleSettings() {
		showSettings = !showSettings;
	}

	function closeSettings() {
		showSettings = false;
	}

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
		<MainView/>
	</div>
</div>

<style>
	:global(.font-catriel) {
		font-family: 'Catriel', sans-serif;
	}
</style>