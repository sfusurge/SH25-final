<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import type { Writable } from "svelte/store";
	import {
		Stock,
		scoreStore,
		gamePaused,
	} from "$lib/components/leaf/gameData/LeafGame";
	export let plantsStore: Writable<
		Record<string, { key: string; state: Stock; points: number }>
	>;

	export let game: any;

	// Map plant keys to filenames inside shop_restock/ and shop_unlock/
	const fileByKey: Record<string, string> = {
		plant1: "monstera.png",
		plant2: "vine.png",
		plant3: "tomato.png",
		plant4: "stick.png",
		plant5: "carrot.png",
		plant6: "dandelion.png",
	};

	const dispatch = createEventDispatcher<{
		close: void;
		restock: { plantKey: string };
	}>();

	function close() {
		dispatch("close");
	}
</script>

<div class="backdrop" on:click={close}></div>
<div class="dialog-root">
	<div class="dialog" role="dialog" on:click|stopPropagation>
		<div class="inner">
			<div class="inner-header">
				<h2 id="shop-title">Seed Shop</h2>
				<button type="button" class="close-btn" on:click={close}>
					<img
						src="/assets/experiences/leaf/close.png"
						alt="exit"
						class="close"
					/>
				</button>
			</div>
			<section class="content">
				{#each ["plant4", "plant3", "plant1", "plant6", "plant2", "plant5"] as key (key)}
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
							class="action-btn {p?.state === Stock.Default
								? 'unlock-btn'
								: 'restock-btn'}"
							disabled={!p ||
								p.state === Stock.Available ||
								(p?.state === Stock.Default &&
									$scoreStore < p.points) ||
								$gamePaused}
							on:click={() => {
								if (!p) return;
								if (p.state === Stock.OutOfStock)
									dispatch("restock", { plantKey: key });
								else if (
									p.state === Stock.Default &&
									$scoreStore >= p.points
								)
									game.unlockPlant(key);
							}}
						>
							{#if p?.state === Stock.Default}
								Unlock
							{:else if p?.state === Stock.OutOfStock}
								Restock
							{:else}
								Available
							{/if}
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
		top: 48%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 44%;
		height: 75%;
		background:
			url("/assets/experiences/leaf/modal_bg.png") center / cover
				no-repeat,
			#0f1c1b;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
		display: grid;
		place-items: center;
		overflow: hidden;
	}

	.inner {
		width: 70%;
		height: 80%;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		color: #fff;
	}

	.inner-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 12cqw;
	}

	.inner-header h2 {
		font-family: "Catriel", catriel, sans-serif;
		font-weight: 400;
		font-style: italic;
		font-size: 2cqw;
		margin: 0;
	}

	.close-btn {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		width: 2.5cqw;
		height: auto;
	}

	.content {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-auto-rows: auto;
		column-gap: 3.5%;
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
		display: flex;
		width: 100%;
		height: 110%;
		aspect-ratio: 333 / 50;
		padding: 4px 10px;
		justify-content: center;
		align-items: center;
		gap: 10px;
		border: 1px solid #8a6f6a;
		background: rgba(6, 6, 5, 0.6);
		cursor: pointer;
		font-size: 1cqw;
		font-weight: 100;
		color: #8a6f6a;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		margin-bottom: 1cqh;
	}

	.action-btn:hover {
		border-color: #b8958a;
		color: #b8958a;
		box-shadow: 0 0 10px rgba(184, 149, 138, 0.3);
		transform: translateY(-1px);
	}

	.action-btn:active {
		transform: translateY(0);
		box-shadow: 0 0 5px rgba(184, 149, 138, 0.2);
	}

	.restock-btn:hover {
		border-color: #b8958a;
		color: #b8958a;
		box-shadow: 0 0 10px rgba(184, 149, 138, 0.3);
	}

	.unlock-btn:hover {
		border-color: #b8958a;
		color: #b8958a;
		box-shadow: 0 0 10px rgba(184, 149, 138, 0.3);
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
			font-size: 4cqw;
		}

		.close {
			font-size: 4cqw;
		}

		.content {
			column-gap: 1%;
		}

		.card {
			gap: 0.8cqh;
		}

		.plant-img {
			max-height: 28cqh;
			width: 88%;
		}

		.close-btn {
			width: 5cqw;
		}

		.action-btn {
			width: 88%;
			height: 3cqw;
			font-size: 2.25cqw;
		}
	}

	@container (max-width: 400px) {
		.dialog {
			width: 95%;
			height: 50%;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}

		.content {
			column-gap: 1.5%;
		}

		.inner-header h2 {
			font-size: 4cqw;
		}

		.close {
			font-size: 4cqw;
		}

		.plant-img {
			max-height: 28cqw;
			width: 21cqw;
		}

		.action-btn {
			width: 21cqw;
			height: 5cqw;
		}

		.close-btn {
			width: 4cqw;
		}

		.inner-header h2 {
			font-size: 4cqw;
		}
	}
</style>
