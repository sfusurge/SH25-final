<script lang="ts">
	import Bucket from './Bucket.svelte';
	import CenterStrip from './CenterStrip.svelte';
	import { bucketData } from '$lib/components/leaf/gameData/bucketData';
	import Customer from '$lib/components/leaf/Customer.svelte';
	import ShopModal from '$lib/components/leaf/ShopModal.svelte';
	import QTE from '$lib/components/leaf/QTE.svelte';
	import { observeLayout, isMobile, isNarrow } from '$lib/components/leaf/gameData/layout';
	import {
		OrderStatus,
		orderEntities,
		game,
		displaySlots,
		plantsStore,
		mascotFrame,
		nowStore,
		ORDER_DEFAULT_DURATION_MS,
		GAME_DURATION_MS,
		activeQTESessions,
		ENABLE_QTE,
		thanksToasts,
		gamePhase,
		gameEndsAt,
		scoreStore
	} from '$lib/components/leaf/gameData/LeafGame';
	import { derived } from 'svelte/store';
	import { Stock } from '$lib/components/leaf/gameData/LeafGame';
	import { customerSlots } from '$lib/components/leaf/gameData/customerData.ts';
	import InstructionsModal from './InstructionsModal.svelte';
	import EndingModal from './EndingModal.svelte';

	let shopOpen: boolean = false;
	function onOpenModal() {
		shopOpen = true;
	}
	function onCloseModal() {
		shopOpen = false;
	}

	// Use active sessions directly with derived store for better stability
	const reactiveQTESessions = derived(activeQTESessions, (sessions) => sessions);

	function onRestockFromShop(e: CustomEvent<{ plantKey: string }>) {
		const { plantKey } = e.detail;
		onCloseModal();
		queueMicrotask(() => {
			if (ENABLE_QTE) {
				// Try to start a new QTE session (limited to 2 concurrent)
				game.startQTESession(plantKey);
			} else {
				game.restockPlant(plantKey);
			}
		});
	}

	const toText = (ent: { requestedPlants: Record<string, number> }) =>
		Object.entries(ent.requestedPlants)
			.map(([k, qty]) => `${k} x${qty}`)
			.join(', ');

	// Reactive functions that update when layout changes
	$: pickPos = (i: number) => {
		const slot = customerSlots[i];
		if ($isNarrow) return slot.mobileNarrowPosition ?? slot.mobilePosition ?? slot.position;
		if ($isMobile) return slot.mobilePosition ?? slot.position;
		return slot.position;
	};
	$: leftFor = (i: number) => pickPos(i).left;
	$: topFor = (i: number) => pickPos(i).top;
	$: widthFor = (i: number) => pickPos(i).width ?? '8%';

	const timerRatioFor = (ent: { expiresAtMs?: number; totalDurationMs?: number }) => {
		const total = ent.totalDurationMs ?? ORDER_DEFAULT_DURATION_MS;
		if (!ent.expiresAtMs || !total) return undefined;
		const msLeft = Math.max(0, ent.expiresAtMs - $nowStore);
		return msLeft / total;
	};

	// Global session countdown text (MM:SS)
	$: sessionTimeLeftMs =
		$gamePhase === 'running' && $gameEndsAt
			? Math.max(0, $gameEndsAt - $nowStore)
			: $gamePhase === 'ended'
				? 0
				: GAME_DURATION_MS;
	function fmt(ms: number) {
		const s = Math.floor(ms / 1000);
		const mm = String(Math.floor(s / 60)).padStart(2, '0');
		const ss = String(s % 60).padStart(2, '0');
		return `${mm}:${ss}`;
	}

	$: orderWidthFor = (i: number) => {
		const slot = customerSlots[i];
		if ($isNarrow) return slot.mobileNarrowOrderWidth ?? slot.mobileOrderWidth ?? slot.orderWidth;
		if ($isMobile) return slot.mobileOrderWidth ?? slot.orderWidth;
		return slot.orderWidth;
	};

	$: orderTransformFor = (i: number, baseTranslate: string) => {
		const slot = customerSlots[i];
		const t = $isNarrow
			? (slot.mobileNarrowOrderTransform ?? slot.mobileOrderTransform ?? slot.orderTransform)
			: $isMobile
				? (slot.mobileOrderTransform ?? slot.orderTransform)
				: slot.orderTransform;
		return t ?? baseTranslate;
	};
</script>

{#if ENABLE_QTE && $activeQTESessions.length > 0}
	{#each $activeQTESessions as session}
		{#if $plantsStore[session.plantKey] && $plantsStore[session.plantKey].state !== Stock.OutOfStock}
			{@html (() => {
				game.endQTESession(session.plantKey);
				return '';
			})()}
		{/if}
	{/each}
{/if}

<div class="background" use:observeLayout>
	{#if $isMobile}
		<img src="/assets/experiences/leaf/background_mobile.png" alt="Background" class="background-image" />
	{:else}
		<img src="/assets/experiences/leaf/background.png" alt="Background" class="background-image" />
	{/if}

	<!-- Rays overlay -->
	<img src="/assets/experiences/leaf/shop_restock/rays.png" alt="" class="rays" />

	<!-- Vignette overlay -->
	<div class="vignette"></div>

	<!-- Corner overlays -->
	{#if !$isMobile}
		<img src="/assets/experiences/leaf/left.png" alt="" class="edge edge-left" />
		<img src="/assets/experiences/leaf/right.png" alt="" class="edge edge-right" />
	{/if}

	{#each bucketData as bucket (bucket.id)}
		<Bucket {bucket} />
	{/each}

	<!-- Customers from fixed slots to keep positions stable -->
	{#each $displaySlots as slotId, i}
		{#if slotId !== null}
			{#if $orderEntities[slotId]}
				{@const ent = $orderEntities[slotId]}
				<Customer
					state={ent.status as OrderStatus}
					orderText={toText(ent)}
					orderItems={ent.requestedPlants}
					timerRatio={timerRatioFor(ent)}
					hurry={ent.hurry}
					left={leftFor(i)}
					top={topFor(i)}
					imageWidth={widthFor(i)}
					orderWidth={orderWidthFor(i)}
					orderTransform={orderTransformFor(i, '')}
					mirror={i === 0}
					thanksAmount={$thanksToasts.find((t) => t.slotIdx === i)?.amount ?? null}
					on:click={() => game.deliverPlant(ent.id)}
				/>
			{/if}
		{/if}
	{/each}

	{#if $mascotFrame === 'success'}
		<img src="/assets/experiences/leaf/mascot/success.png" alt="Mascot" class="mascot" />
	{:else if $mascotFrame === 'failure'}
		<img src="/assets/experiences/leaf/mascot/failure.png" alt="Mascot" class="mascot" />
	{:else if $mascotFrame === 'default2'}
		<img src="/assets/experiences/leaf/mascot/default_frame2.png" alt="Mascot" class="mascot" />
	{:else}
		<img src="/assets/experiences/leaf/mascot/default_frame1.png" alt="Mascot" class="mascot" />
	{/if}

	<CenterStrip
		onOpenModal={$gamePhase === 'running' ? onOpenModal : undefined}
		timerText={fmt(sessionTimeLeftMs)}
		onStartGame={() => game.startGame()}
		onRestartGame={() => game.startGame()}
	/>

	{#if shopOpen}
		<ShopModal {plantsStore} {game} on:close={onCloseModal} on:restock={onRestockFromShop} />
	{/if}

	{#if $gamePhase === 'pre'}
		<InstructionsModal onStart={() => game.startGame()} />
	{/if}

	{#if $gamePhase === 'ended'}
		<EndingModal score={$scoreStore} onRestart={() => game.startGame()} />
	{/if}

	{#if ENABLE_QTE && $reactiveQTESessions.length > 0}
		<!-- QTE overlays for each active session (no global dimmer) -->
		{#each $reactiveQTESessions as session (session.id)}
			{#if session}
				<div
					class="qte-overlay"
					style="left: {session.leftPct}; top: {session.topPct}; transform: {session.transformCss ??
						'none'}"
				>
					<QTE
						config={session.config}
						attempts={3}
						onQTE={() => {}}
						onDone={(successes) => {
							const s = Math.max(0, Math.min(3, Number(successes) || 0));
							const multiplier = s === 0 ? 0.5 : s === 1 ? 1.0 : s === 2 ? 1.5 : 3.0;
							const plantKey = session.plantKey;
							if (plantKey) {
								game.restockPlantWithMultiplier(plantKey, multiplier);
								game.endQTESession(plantKey);
							}
						}}
					/>
				</div>
			{/if}
		{/each}
	{/if}
</div>

<style>
	* {
		--leafGameHeight: 80vh;
	}

	.background {
		height: 100%;
		width: 100%;
		position: relative;
		container-type: size;
		overflow: hidden;
	}

	.background-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 0;
	}

	.rays {
		position: absolute;
		left: 50%;
		top: 0;
		transform: translateX(-50%);
		z-index: 1;
		pointer-events: none;
	}

	.vignette {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 2;
		background:
			radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 55%, rgba(0, 0, 0, 0.35) 100%),
			radial-gradient(ellipse at top left, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0) 50%),
			radial-gradient(ellipse at top right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0) 50%),
			radial-gradient(ellipse at bottom left, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0) 60%),
			radial-gradient(ellipse at bottom right, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0) 60%);
	}

	.edge {
		position: absolute;
		bottom: 0;
	}

	.edge-left {
		left: 0;
		width: 28%;
		transform: translate(-15%, 0);
	}
	.edge-right {
		right: 0;
		width: 20%;
	}

	.mascot {
		position: absolute;
		left: 44%;
		top: 40%;
		width: 12%;
		height: auto;
		z-index: 1;
	}

	/* removed unused toast styles; thanks now renders inside Customer's Order bubble */

	.qte-overlay {
		position: absolute;
		z-index: 150;
		pointer-events: auto;
	}

	.qte-dimmer {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.35);
		z-index: 140;
		pointer-events: all; /* block interactions behind */
	}

	/* .tempqte {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		z-index: 150;
	} */

	@keyframes -global-scroll {
		0% {
			background-position: 0 0;
		}

		100% {
			background-position: calc(-100% + 99vw) 0;
		}
	}

	@container (max-width: 640px) {
		.mascot {
			width: 30%;
			left: 33%;
			top: 43%;
			z-index: 100;
		}
	}
	@container (max-width: 400px) {
		.mascot {
			width: 43%;
			left: 27%;
			top: 43%;
			z-index: 100;
		}
	}
</style>
