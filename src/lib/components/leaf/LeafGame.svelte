<script lang="ts">
	import Background from "./Background.svelte";
</script>

<!-- LeafGame focuses purely on game content - all sizing handled by Frame container -->
<div id="leafGame">
	<Background />
</div>

<style>
	#leafGame {
		/* Fill the container provided by Frame */
		width: 100%;
		height: 100%;

		/* Game content styling */
		overflow: hidden;
		background: #1b3534;
		border: 1px solid;

		/* Ensure proper stacking context */
		position: relative;
	}
</style>
