<script lang="ts">
	import HudBox from './HudBox.svelte';
	import { scoreStore, gamePhase } from '$lib/components/leaf/gameData/LeafGame';

	export let timerText: string = '00:00';
	export let onOpenModal;
	export let onStartGame: (() => void) | undefined;
	export let onRestartGame: (() => void) | undefined;
</script>

<div class="center-strip">
	<div class="hud">
		<HudBox mode="display" iconSrc="/assets/experiences/leaf/timeIcon.png" value={timerText} />
		<HudBox mode="display" iconSrc="/assets/experiences/leaf/leafIcon.png" value={$scoreStore} />
		{#if $gamePhase === 'pre'}
			<HudBox mode="button" onClick={onStartGame} />
		{:else if $gamePhase === 'ended'}
			<HudBox mode="button" onClick={onRestartGame} />
		{:else}
			<HudBox mode="button" onClick={onOpenModal} />
		{/if}
	</div>
</div>

<style>
	.center-strip {
		position: absolute;
		/* top 28px -> 2.59vh */
		top: 2.59vh;
		left: 50%;
		transform: translateX(-50%);
		z-index: 2;
	}

	.hud {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.8vw;
	}

	@container (max-width: 640px) {
		.center-strip {
			width: 90%; /* nearly full width; use 95cqw for slight inset */
		}
		.hud {
			width: 100%; /* let the flex row span the strip */
			justify-content: space-between; /* spread the 3 boxes edge-to-edge */
			gap: 0cqw; /* small minimum spacing */
			padding: 0 3cqw;
		}
	}
</style>
