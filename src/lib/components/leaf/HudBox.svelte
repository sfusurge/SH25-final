<script lang="ts">
	// Mode: display shows icon+value; button shows inner clickable icon
	export let mode: 'display' | 'button' = 'display';

	// Content
	export let value: string | number | undefined = undefined;
	export let onClick: (() => void) | undefined = undefined;

	// Visual assets
	export let containerSrc: string = '/assets/experiences/leaf/container.png'; // box background (from /static)
	export let iconSrc: string | undefined = undefined; // left icon in display mode
</script>

{#if mode === 'button'}
	<!-- Static background box; only the inner image button is clickable -->
	<div class="hud-box" style="background-image: url({containerSrc});">
		<button type="button" class="icon-button" on:click={onClick}>
			<img src="/assets/experiences/leaf/view_shop.png" alt="" class="icon" />
		</button>
	</div>
{:else}
	<div class="hud-box" style="background-image: url({containerSrc});">
		{#if iconSrc}
			<img src={iconSrc} alt="" class="left-icon" />
		{/if}
		{#if value !== undefined}
			<span class="value" aria-live="polite">{value}</span>
		{/if}
	</div>
{/if}

<style>
	.hud-box {
		/* 181px x 43px -> 9.43vw x 3.98vh */
		width: 9.43vw;
		height: 3.98vh;
		background-size: 100% 100%;
		background-repeat: no-repeat;
		background-position: center;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
		gap: 0.6vw;
		border: 0;
		padding: 0 0.8vw;
	}

	/* Default left icon size; can be overridden inline */
	.left-icon {
		width: 1.2cqw;
		height: 1.2cqw;
		pointer-events: none;
	}

	.icon-button {
		background: transparent;
		border: 0;
		padding: 0;
		cursor: pointer;
		display: inline-flex;
		width: 5.6vw;
		height: 2.2vh;
		align-items: center;
		justify-content: center;
		transition:
			transform 0.15s ease,
			filter 0.15s ease;
	}
	/* .icon-button:hover { } */
	.icon-button:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 2px;
	}

	.icon {
		width: 100%;
		height: 100%;
		object-fit: contain;
		pointer-events: auto;
	}

	.value {
		font-size: max(0.625vw, 1.11vh);
		color: #8a6f6a;
		font-family: 'Catriel', catriel, sans-serif;
		font-weight: 400;
		letter-spacing: 0.02em;
	}

	@container (max-width: 640px) {
		.hud-box {
			width: 25vw;
			height: 4vh;
			background-size: 100% 100%;
			display: inline-flex;
			align-items: center;
		}

		.left-icon {
			width: 2.2cqw !important;
			height: 2.2cqw !important;
		}

		.icon-button {
			width: 15cqw !important;
			height: 3.5cqw !important;
		}

		.value {
			font-size: 2.5cqw !important;
			font-weight: 400;
			letter-spacing: 0.02em;
		}
	}

	@container (max-width: 400px) {
		.hud-box {
			width: 25vw;
			height: 5vh;
			background-size: 100% 100%;
			display: inline-flex;
			align-items: center;
		}

		.left-icon {
			width: 4.5cqw !important;
			height: 4.5cqw !important;
		}

		.icon-button {
			width: 22.5cqw !important;
			height: 25cqw !important;
		}

		.value {
			font-size: 3.5cqw !important;
			font-weight: 400;
			letter-spacing: 0.02em;
		}
	}
</style>
