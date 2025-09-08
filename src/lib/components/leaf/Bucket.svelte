<script lang="ts">
	import type { BucketData } from "$lib/components/leaf/gameData/bucketData";
	import { Stock } from "$lib/components/leaf/gameData/LeafGame";
	import Plant from "./Plant.svelte";
	import { plantData } from "$lib/components/leaf/gameData/plantData";
	import { game, plantsStore } from "$lib/components/leaf/gameData/LeafGame";
	import { isMobile, isNarrow } from "$lib/components/leaf/gameData/layout";

	export let bucket: BucketData;

	$: bucketNum = Number(bucket.key.replace("bucket", ""));
	$: matchingPlant = plantData.find((p) => p.id === bucketNum);
	$: plantState = matchingPlant
		? $plantsStore[matchingPlant.key]?.state
		: undefined;
	$: isDefault = plantState === Stock.Default;
	$: isAvailable = plantState === Stock.Available;
	$: isOut = plantState === Stock.OutOfStock;
	$: imgSrc = isDefault
		? bucket.images.default
		: isAvailable
			? bucket.images.available
			: bucket.images.outOfStock;
</script>

<img
	src={imgSrc}
	alt={bucket.altText}
	class="bucket"
	class:available={isAvailable}
	class:default={isDefault}
	class:out={isOut}
	class:topBucket={bucket.key === "bucket5" || bucket.id === 5}
	class:bucket1={bucket.key === "bucket1"}
	style="left: {$isNarrow && bucket.mobileVeryNarrowPosition
		? bucket.mobileVeryNarrowPosition.left
		: $isMobile && bucket.mobilePosition
			? bucket.mobilePosition.left
			: bucket.position.left}; top: {$isNarrow &&
	bucket.mobileVeryNarrowPosition
		? bucket.mobileVeryNarrowPosition.top
		: $isMobile && bucket.mobilePosition
			? bucket.mobilePosition.top
			: bucket.position.top}; width: {$isNarrow &&
	bucket.mobileVeryNarrowPosition
		? bucket.mobileVeryNarrowPosition.width
		: $isMobile && bucket.mobilePosition
			? bucket.mobilePosition.width
			: bucket.position.width}; transform: translate(-50%, 0)"
	draggable="false"
/>

{#if !isDefault && matchingPlant}
	<Plant
		plant={matchingPlant}
		bucketState={plantState ?? Stock.Default}
		basePosition={{
			left:
				$isNarrow && bucket.mobileVeryNarrowPosition
					? bucket.mobileVeryNarrowPosition.left
					: $isMobile && bucket.mobilePosition
						? bucket.mobilePosition.left
						: bucket.position.left,
			top:
				$isNarrow && bucket.mobileVeryNarrowPosition
					? bucket.mobileVeryNarrowPosition.top
					: $isMobile && bucket.mobilePosition
						? bucket.mobilePosition.top
						: bucket.position.top,
		}}
		on:click={() => game.plantClick(matchingPlant.key)}
	/>
{/if}

<style>
	.bucket {
		display: block;
		position: absolute;
		height: auto;
		z-index: 20;
		cursor: default;
	}

	.bucket.topBucket {
		z-index: 7;
	}

	.bucket.bucket1 {
		z-index: 15;
	}
</style>
