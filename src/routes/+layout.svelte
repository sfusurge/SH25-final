<script module>
	let width = $state(0);
	let medium = $derived(600 <= width && width < 800);
	let mobile = $derived(width < 600);
	let desktop = $derived(width >= 800);
	export const global = {
		get mobile() {
			return mobile;
		},
		get medium() {
			return medium;
		},
		get desktop() {
			return desktop;
		},
		get width() {
			return width;
		},
	};
</script>

<script lang="ts">
	import "../app.css";

	import Sidebar from "$lib/components/landing/Sidebar/Sidebar.svelte";
	import AmbiancePlayer from "$lib/components/landing/Audio/AmbiancePlayer.svelte";
	import type { Snippet } from "svelte";

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="h-screen w-full relative overflow-x-hidden sm:overflow-hidden bg-[#0C0C0B]">
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
			data-demon="background"
		></div>
	</div>

	<div class="relative z-30 flex flex-row h-full">
		<Sidebar />
		{@render children()}
	</div>
</div>

<svelte:window bind:innerWidth={width} />

<style>
</style>
