<script lang="ts">
	import Order from '$lib/components/leaf/Order.svelte';
	import { OrderStatus } from '$lib/components/leaf/gameData/LeafGame';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let alt: string = 'Customer';
	export let left: string;
	export let top: string;
	export let imageWidth: string;
	export let mirror: boolean = false;

	export let state: OrderStatus = OrderStatus.InProgress;
	export let timerRatio: number | undefined = undefined;
	export let hurry: boolean | undefined = undefined;

	export let orderText: string = '';
	export let orderItems: Record<string, number> | undefined = undefined;
	export let thanksAmount: number | null = null;

	export let orderWidth: string | undefined = undefined;
	export let orderTransform: string | undefined = undefined;

	const customerImages: Record<OrderStatus, string> = {
		[OrderStatus.InProgress]: '/assets/experiences/leaf/customer/default.png',
		[OrderStatus.Success]: '/assets/experiences/leaf/customer/success.png',
		[OrderStatus.Fail]: '/assets/experiences/leaf/customer/failure.png'
	};

	$: customerSrc =
		state === OrderStatus.InProgress && hurry ? '/assets/experiences/leaf/customer/failure.png' : customerImages[state];

	const plantIcons: Record<string, string> = {
		plant1: '/assets/experiences/leaf/icons/monstera.png',
		plant2: '/assets/experiences/leaf/icons/vine.png',
		plant3: '/assets/experiences/leaf/icons/tomato.png',
		plant4: '/assets/experiences/leaf/icons/stick.png',
		plant5: '/assets/experiences/leaf/icons/carrot.png',
		plant6: '/assets/experiences/leaf/icons/dandelion.png'
	};

	$: plantOrders = orderItems ? Object.keys(orderItems).length : 1;
	$: scale = plantOrders === 1 ? 1.0 : plantOrders === 2 ? 1.0 : 0.95;
</script>

{#if thanksAmount != null}
	<Order
		left={`calc(${left} + (${imageWidth}) / 2)`}
		{top}
		translate={orderTransform ?? 'translate(-50%, calc(-100% - 5%))'}
		progress={undefined}
		style={orderWidth ? `--orderW:${orderWidth}` : undefined}
	>
		<div class="thanks-wrap">
			<div class="thanks-title">Thanks!</div>
			<div class="thanks-amount">
				<img src="/assets/experiences/leaf/leafIcon.png" alt="" class="thanks-icon" />
				{thanksAmount}
			</div>
		</div>
	</Order>
{:else if state === OrderStatus.InProgress}
	<Order
		left={`calc(${left} + (${imageWidth}) / 2)`}
		{top}
		translate={orderTransform ?? 'translate(-50%, calc(-100% - 5%))'}
		progress={timerRatio}
		style={orderWidth ? `--orderW:${orderWidth}` : undefined}
	>
		{#if orderItems}
			<div class="order-icons" style="--content-scale: {scale};">
				{#each Object.entries(orderItems) as [k, qty]}
					<div class="order-icon-item">
						<img src={plantIcons[k]} alt={k} class="order-icon" draggable="false" />
						<span class="order-qty">x{qty}</span>
					</div>
				{/each}
			</div>
		{:else}
			<div class="order-text" style="--content-scale: {scale};">
				{orderText}
			</div>
		{/if}
	</Order>
{/if}

<div
	class="customer-hit"
	style:left
	style:top
	style:width={imageWidth}
	style:height={imageWidth}
	on:click={() => dispatch('click')}
></div>

<div
	class="customer"
	style:left
	style:top
	style:width={imageWidth}
	on:click={() => dispatch('click')}
>
	<img
		src={customerSrc}
		{alt}
		class="customer-img"
		class:mirrored={mirror}
		style:width="100%"
		draggable="false"
	/>
</div>

<style>
	.customer {
		position: absolute;
		display: block;
		z-index: 1; /* below plants */
	}
	.customer-hit {
		position: absolute;
		z-index: 5; /* above plants */
		background: transparent;
	}
	.customer-img {
		display: block;
		height: auto;
	}
	.customer-img.mirrored {
		transform: scaleX(-1);
		transform-origin: center;
	}
	.order-icons {
		display: flex;
		flex-wrap: wrap;
		gap: calc(6px * var(--content-scale, 1)) calc(8px * var(--content-scale, 1));
		align-items: center;
		justify-content: center;
		--iconSize: calc(3vh * var(--content-scale, 1));
	}
	.order-icon-item {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		min-height: var(--iconSize);
	}
	.order-icon {
		width: var(--iconSize);
		height: var(--iconSize);
		object-fit: contain;
		display: block;
	}
	.order-qty {
		color: #8a6f6a;
		line-height: 1;
		font-size: calc(1.2vh * var(--content-scale, 1));
	}

	.order-text {
		font-size: calc(1.2vh * var(--content-scale, 1));
		text-align: center;
		line-height: 1.3;
	}
	.thanks-wrap {
		display: grid;
		gap: 0.3rem;
		place-items: center;
	}
	.thanks-title {
		font-size: 1.8vh;
		font-weight: 400;
	}
	.thanks-amount {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-weight: 500;
		font-size: 1.8vh;
	}

	.thanks-icon {
		width: 1.5vh;
		height: 1.5vh;
	}
</style>
