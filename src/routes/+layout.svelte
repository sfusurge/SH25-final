<script module>
	let width = $state(0);
	let medium = $derived(700 <= width && width < 1200);
	let mobile = $derived(width < 700);
	let desktop = $derived(width >= 1200);
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
	import { onMount, type Snippet } from "svelte";
	import { dev } from "$app/environment";
	import { page } from "$app/state";

	interface Props {
		children: Snippet;
	}

	if (dev) {
		onMount(() => {
			setInterval(() => {
				width = window.innerWidth;
			}, 100);
		});
	}

	let { children }: Props = $props();
</script>

<svelte:window bind:innerWidth={width} />

<div class="h-screen w-full relative overflow-x-hidden bg-[#0C0C0B]">
	<AmbiancePlayer />

	<!-- background tiling -->
	<div class="absolute inset-0 z-10 overflow-hidden">
		<div
			class="absolute
				bg-[length:82.5px_82.5px]
				bg-center
				bg-repeat
				w-[350%] h-[350%]
				left-[-100%] top-[-100%]
				rotate-45
				origin-center"
			style="background: url('/assets/pattern-element-buffer.svg')"
		></div>
	</div>

	<div class="relative z-30 flex flex-row h-full main" class:medium={global.medium}>
		{#if !global.mobile || (global.mobile && page.url.pathname === "/")}
			<Sidebar />
		{/if}
		{@render children()}
	</div>
</div>

<style>
	.main.medium {
		flex-direction: column;
	}
</style>
