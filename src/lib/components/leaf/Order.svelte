<script lang="ts">
	export let left: string | undefined = undefined;
	export let top: string | undefined = undefined;
	export let translate: string | undefined = undefined;
	export let progress: number | undefined = undefined;

	$: clampedProgress = progress == null ? null : Math.max(0, Math.min(1, progress));
	$: pctWidth = clampedProgress == null ? '100%' : `${Math.round(clampedProgress * 100)}%`;
	$: hasTimer = progress !== undefined;
</script>

<div class="order-card" style:left style:top style:transform={translate} {...$$restProps}>
	<slot />
	{#if hasTimer}
		<div class="order-timer">
			<div class="order-timer-fill" style:width={pctWidth}></div>
		</div>
	{/if}
</div>

<div class="bubble-tail" style:left style:top style:transform={translate}>
	<img src="/assets/experiences/leaf/bubble.png" />
</div>

<style>
	.order-card {
		position: absolute;
		background: #fffccf;
		border-radius: 0.5208333333vw;
		padding: 0.5vw 0.6vw 0.9375vw;
		width: var(--orderW, 5%);
		max-height: 9.3vh;
		font-family: sans-serif;
		color: #6d6d6d;
		font-size: 1.2vh;
		line-height: 1.3;
		z-index: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		overflow: hidden;
	}

	.bubble-tail {
		position: absolute;
		z-index: 0;
		pointer-events: none;
		transform: translateY(9.3vh);
		width: 0.8%;
	}

	.order-timer {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0.3125vw;
		height: 0.4166666667vw;
		background: rgba(0, 0, 0, 0.15);
		border-radius: 0;
		overflow: hidden;
	}
	.order-timer-fill {
		height: 100%;
		background: #7a5b73;
		border-radius: 0;
	}
</style>
