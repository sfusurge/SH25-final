<script lang="ts">
	import Pause from "./Pause.svelte";
	import DesktopShop from "$lib/components/leaf/DesktopShop.svelte";
	import Frame from "$lib/components/leaf/Frame.svelte";
	import DesktopTimer from "./DesktopTimer.svelte";
	import DesktopScore from "./DesktopScore.svelte";
</script>

<div class="flex-1 sm:flex flex-col hidden h-full" style="max-height: 100dvh">
	<div class="flex justify-between items-start pt-8 px-8">
		<Pause />
		<DesktopShop />
	</div>

	<div
		class="m-8 flex-1 flex items-center justify-center"
		style="min-height: 0"
	>
		<Frame />
	</div>

	<div class="flex justify-center items-start pb-4 gap-8">
		<DesktopTimer />
		<DesktopScore />
	</div>
</div>
