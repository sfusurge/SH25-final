<script lang="ts">
	export let onStart: (() => void) | undefined;
	export let isRunning: boolean = false;
	let pictures: string[] = [
		"/assets/experiences/leaf/starting_modal/start_1.png",
		"/assets/experiences/leaf/starting_modal/start_2.png",
		"/assets/experiences/leaf/starting_modal/start_3.png",
	];
	let descriptions: string[] = [
		"Provide plants to your visitors as they make requests, using the Seed Shop to Restock a plant or Unlock more valuable options. <strong>Click on the plant, then click on the visitor to deliver their request!</strong>",
		"To grow a worthy plant, <strong>Click/Tap when the white line is in the target range</strong>. The more successes, the more valuable the plant! Don't forget to restock for the next visitor.",
		"Careful! Visitors have <strong>limited patience</strong>, and <strong>plants will go out of stock every 10 deliveries</strong>. Get the right plant to the customer quickly, and restock in the shop when necessary!",
	];
	let picIdx: number = 0;
	function nextPicture() {
		picIdx = (picIdx + 1) % pictures.length;
	}
</script>

<div class="modal-backdrop">
	<div class="modal">
		<div class="content">
			<div class="inner">
				<div class="header">
					<h2 class="title">Community Garden</h2>
					<button class="start-btn" type="button" on:click={onStart}
						>{isRunning ? "Continue Game" : "Start Game"}</button
					>
				</div>
				<div class="picture">
					<img src={pictures[picIdx]} alt="Instruction" />
				</div>
				<div class="description">
					{@html descriptions[picIdx]}
				</div>
				<div class="nav-buttons">
					<button
						class="nav-btn"
						type="button"
						on:click={() =>
							(picIdx =
								picIdx > 0 ? picIdx - 1 : pictures.length - 1)}
					>
						<img
							src="/assets/experiences/leaf/back_button.png"
							alt="Previous"
						/>
					</button>
					<button
						class="nav-btn"
						type="button"
						on:click={nextPicture}
					>
						<img
							src="/assets/experiences/leaf/next_button.png"
							alt="Next"
						/>
					</button>
				</div>
				<div class="pagination">
					{#each pictures as _, index}
						<div
							class="pagination-dot"
							class:active={index === picIdx}
						></div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.modal-backdrop {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: block;
		z-index: 1000000; /* Highest priority - above all game elements */
	}
	.modal {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 50%;
		height: 77.5%;
		background: url("/assets/experiences/leaf/modal_bg.png") center / 100%
			100% no-repeat;
		border-radius: 0;
		padding: 0;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
		text-align: left;
		overflow: hidden;
	}

	.content {
		padding: 5cqh 3cqw;
		box-sizing: border-box;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.inner {
		width: 90%;
		height: 95%;
		padding: 0.5cqh 0.5cqw;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.9cqh;
		max-height: 100%;
		overflow: hidden;
	}
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1cqw;
		width: 100%;
		flex-wrap: wrap;
	}
	.title {
		margin: 0;
		color: #f1eceb;
		text-align: left;
		font-family: var(--font-catriel);
		font-size: 2cqw;
		font-style: italic;
		font-weight: 5900;
		line-height: normal;
	}
	.picture {
		width: 100%;
		aspect-ratio: 253 / 148;
		height: auto;
		flex-shrink: 0;
		margin-top: 1cqh;
	}
	.picture > img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
	}
	.description {
		width: 100%;
		height: 8cqh;
		margin: -1cqh 0 0 0;
		padding: 0;
		color: #8a6f6a;
		font-family: Catriel, sans-serif;
		font-size: 1.2cqw;
		font-style: normal;
		font-weight: 400;
		line-height: normal;
		text-align: left;
		overflow: hidden;
	}
	.start-btn {
		display: flex;
		width: 12cqw;
		height: 2.5cqw;
		justify-content: center;
		align-items: center;
		gap: 0.5cqw;
		flex-shrink: 0;
		background: rgba(6, 6, 5, 0.6);
		color: #f1eceb;
		border: 0.643px solid #f1eceb;
		border-radius: 0;
		font-size: 1cqw;
		cursor: pointer;
	}
	.nav-buttons {
		display: flex;
		gap: 0;
		justify-content: center;
		align-items: center;
	}
	.nav-btn {
		display: flex;
		width: 5cqw;
		height: 2.5cqw;
		padding: 0;
		margin: 0 -1cqw;
		align-items: center;
		gap: 0;
		background: transparent;
		border: none;
		cursor: pointer;
		justify-content: center;
	}
	.nav-btn img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.pagination {
		display: flex;
		gap: 0.2cqw;
		justify-content: center;
		align-items: center;
		margin-top: 0.5cqh;
	}
	.pagination-dot {
		width: 0.4cqw;
		height: 0.4cqw;
		background-color: rgba(241, 236, 235, 0.3);
		border-radius: 0;
		transition: background-color 0.2s ease;
	}
	.pagination-dot.active {
		background-color: #f1eceb;
	}

	@container (max-width: 640px) {
		.modal {
			width: 90%;
			height: 60%;
		}

		.inner {
			width: 75%;
			height: 95%;
		}

		.title {
			font-size: 4cqw;
		}

		.start-btn {
			width: 20cqw;
			height: 4.5cqw;
			font-size: 2cqw;
		}

		.description {
			height: 20cqh;
			padding: 0;
			font-size: 2cqw;
		}

		.nav-btn img {
			width: 6cqw;
			height: 6cqw;
			object-fit: contain;
		}

		.nav-btn {
			margin: 0 0.5cqw;
		}

		.pagination-dot {
			width: 0.8cqw;
			height: 0.8cqw;
		}

		.pagination {
			gap: 0.5cqw;
		}
	}

	@container (max-width: 400px) {
		.modal {
			width: 90%;
			height: 48%;
		}

		.inner {
			width: 90%;
			height: 100%;
		}

		.title {
			font-size: 4cqw;
		}

		.start-btn {
			width: 20cqw;
			height: 4.5cqw;
			font-size: 2cqw;
		}

		.description {
			height: 7cqh;
			padding: 0;
			font-size: 2cqw;
			margin-bottom: -4cqh;
		}

		.nav-btn {
			width: 8cqw;
			height: 8cqw;
			margin: 0cqw;
		}

		.pagination-dot {
			width: 1cqw;
			height: 1cqw;
		}

		.pagination {
			gap: 0.6cqw;
		}

		.nav-btn {
			display: flex;
			width: 5cqw;
			height: 2.5cqw;
			padding: 0;
			margin: 0 -6cqw;
		}
	}
</style>
