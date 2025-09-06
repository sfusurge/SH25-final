<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { Stock, scoreStore } from '$lib/components/leaf/gameData/LeafGame';

	export let plantsStore: Writable<Record<string, { key: string; state: Stock; points: number }>>;
	export let game: any;

	// Map plant keys to filenames inside shop_restock/ and shop_unlock/
	const fileByKey: Record<string, string> = {
		plant1: 'monstera.png',
		plant2: 'vine.png',
		plant3: 'tomato.png',
		plant4: 'stick.png',
		plant5: 'carrot.png',
		plant6: 'dandelion.png'
	};

	const dispatch = createEventDispatcher<{ close: void; restock: { plantKey: string } }>();

	function close() {
		dispatch('close');
	}
</script>

<div class="backdrop" on:click={close}></div>
<div class="dialog-root">
	<div
		class="dialog"
		role="dialog"
		aria-modal="true"
		aria-labelledby="shop-title"
		on:click|stopPropagation
	>
		<div class="inner">
			<div class="inner-header">
				<h2 id="shop-title">Seed Shop</h2>
				<button class="close" type="button" on:click={close} aria-label="Close">✕</button>
			</div>
			<section class="content">
				{#each ['plant4', 'plant3', 'plant1', 'plant6', 'plant2', 'plant5'] as key (key)}
					{@const p = $plantsStore[key]}
					<div class="card">
						<img
							src={p?.state === Stock.OutOfStock
								? `/assets/experiences/leaf/shop_restock/${fileByKey[key]}`
								: p?.state === Stock.Default
									? `/assets/experiences/leaf/shop_unlock/${fileByKey[key]}`
									: `/assets/experiences/leaf/shop_restock/${fileByKey[key]}`}
							alt={key}
							class="plant-img"
							draggable="false"
						/>
						<button
							type="button"
							class="action-btn {p?.state === Stock.Default ? 'unlock-btn' : 'restock-btn'}"
							disabled={!p ||
								p.state === Stock.Available ||
								(p?.state === Stock.Default && $scoreStore < p.points)}
							on:click={() => {
								if (!p) return;
								if (p.state === Stock.OutOfStock) dispatch('restock', { plantKey: key });
								else if (p.state === Stock.Default && $scoreStore >= p.points)
									game.unlockPlant(key);
							}}
						>
						</button>
					</div>
				{/each}
			</section>
		</div>
	</div>
</div>

<style>
	/* Fullscreen backdrop */
	.backdrop {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 200;
	}

	/* Root centers the dialog above the backdrop */
	.dialog-root {
		position: absolute;
		inset: 0;
		display: grid;
		justify-items: center;
		align-items: start;
		z-index: 201;
	}

	.dialog {
		position: absolute;
		left: 50%;
		top: 8.6%;
		transform: translateX(-50%);
		width: 30%;
		height: 80%;
		background:
			url('/assets/experiences/leaf/modal_bg.png') center / cover no-repeat,
			#0f1c1b;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
		display: grid;
		place-items: center;
		overflow: hidden;
	}

	.inner {
		width: 73%;
		height: 79.2%;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		color: #fff;
	}

	.inner-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.inner-header h2 {
		font-family: 'Catriel', catriel, sans-serif;
		font-weight: 400;
		font-style: italic;
		font-size: 1.25cqw;
		margin: 0;
	}

	.close {
		background: transparent;
		border: 0;
		color: #fff;
		font-size: 1.2cqw; /* scales with background width */
		cursor: pointer;
	}

	.content {
		padding: 0; /* no padding between border */
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-auto-rows: auto;
		column-gap: 3.5%; /* ~15.36px over 438px ≈ 3.5% of inner width */
		row-gap: 0; /* no vertical gap */
		justify-items: stretch;
		align-items: start;
		overflow: hidden; /* no scrollbars */
		flex: 1;
	}

	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.8cqh; /* increase spacing between image and button */
		padding: 0;
		margin: 0;
		width: 100%;
	}

	.plant-img {
		width: 100%; /* match column width */
		height: auto; /* let width drive size to avoid narrower rendering */
		max-height: 24cqh; /* cap by background height for consistent scaling */
		object-fit: contain;
		display: block;
	}

	.action-btn {
		background: transparent;
		border: 0;
		padding: 0;
		width: 100%;
		aspect-ratio: 333 / 50; /* keep image-based button proportional */
		background-size: 100% 100%;
		background-repeat: no-repeat;
		background-position: center;
		cursor: pointer;
		font-size: 0.9cqw; /* scale button label with background width */
		font-weight: 100;
		color: #8a6f6a;
	}
	.restock-btn {
		background-image: url('/assets/experiences/leaf/shop_restock/button.png');
	}
	.unlock-btn {
		background-image: url('/assets/experiences/leaf/shop_unlock/button.png');
	}
	.action-btn:disabled {
		opacity: 0.5;
		cursor: default;
	}

	@container (max-width: 640px) {
		.dialog {
			width: 90%;
			height: 70%;
		}

		.inner-header h2 {
			font-size: 3cqw;
		}

		.close {
			font-size: 3cqw;
		}

		.plant-img {
			max-height: 30cqh;
		}

		.action-btn {
			width: 100%;
		}
	}

	@container (max-width: 400px) {
		.dialog {
			width: 95%;
			height: 50%;
			left: 50%;
			top: 20%;
		}

		.inner-header h2 {
			font-size: 3cqw;
		}

		.close {
			font-size: 3cqw;
		}

		.plant-img {
			max-height: 28cqw;
		}

		.action-btn {
			width: 100%;
			height: 3cqw;
		}
	}
</style>
