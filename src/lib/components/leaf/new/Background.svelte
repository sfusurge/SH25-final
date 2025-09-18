<script lang="ts">
	import Plant from "./Plant.svelte";

	let plantPositions = [
		{
			key: "monstera",
			position: { left: "18%", top: "61.13%" },
			narrow: { left: "12%", top: "58%" },
			mobile: { left: "10%", top: "55%" },
		},
		{
			key: "vine",
			position: { left: "30%", top: "72%" },
			narrow: { left: "25%", top: "67.5%" },
			mobile: { left: "25%", top: "65%" },
		},
		{
			key: "tomato",
			position: { left: "38%", top: "56%" },
			narrow: { left: "34%", top: "50%" },
			mobile: { left: "35%", top: "47%" },
		},
		{
			key: "stick",
			position: { left: "60%", top: "60%" },
			narrow: { left: "65%", top: "50%" },
			mobile: { left: "67%", top: "47%" },
		},
		{
			key: "carrot",
			position: { left: "68%", top: "78%" },
			narrow: { left: "72%", top: "70%" },
			mobile: { left: "75%", top: "67%" },
		},
		{
			key: "dandelion",
			position: { left: "78%", top: "67%" },
			narrow: { left: "88%", top: "58%" },
			mobile: { left: "93%", top: "55%" },
		},
	];
</script>

<div class="background">
	{#each plantPositions as plant, i}
		<Plant {plant} />
	{/each}
</div>

<style>
	.background {
		position: absolute; /* fill the parent area */
		inset: 0;
		container-type: size;
		overflow: hidden;
		background-color: #144237;

		/* ✅ background image instead of <img> */
		background-image: url("/assets/experiences/leaf/background.png");
		background-size: cover; /* fills container */
		background-position: center; /* centers it */
		background-repeat: no-repeat;
		background-color: #144237; /* fallback color */
	}

	.background-image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover; /* scales nicely in both directions */
		z-index: 0;
	}
</style>
