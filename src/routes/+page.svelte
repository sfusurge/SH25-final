<script lang="ts">
	import MainView from "$lib/components/landing/views/MusicView.svelte";
    import { global } from "./+layout.svelte";
</script>

{#if !global.mobile}
	<!-- content -->
	<MainView />
{/if}
