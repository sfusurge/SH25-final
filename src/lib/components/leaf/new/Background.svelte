<script lang="ts">
	import Plant from "./Plant.svelte";

	// positions and sizing
	let plantPositions = [
		{
			key: "monstera",
			pot: "normal",
			position: { left: "18%", top: "61.13%", width: "9%" },
			narrow: { left: "12%", top: "58%", width: "15%" },
			mobile: { left: "10%", top: "55%", width: "18%" },
			plantTransform: "translate(-35%, -88%)",
			plantPosition: { width: "22%" },
			plantNarrow: { width: "40%" },
			plantMobile: { width: "47%" },
		},
		{
			key: "vine",
			pot: "normal",
			position: { left: "30%", top: "75%", width: "7%" },
			narrow: { left: "25%", top: "67.5%", width: "12%" },
			mobile: { left: "25%", top: "65%", width: "15%" },
			plantTransform: "translate(-34%, -42%)",
			plantPosition: { width: "63%" },
			plantNarrow: { width: "150%" },
			plantMobile: { width: "200%" },
		},
		{
			key: "tomato",
			pot: "normal",
			position: { left: "37%", top: "56%", width: "8%" },
			narrow: { left: "34%", top: "50%", width: "13%" },
			mobile: { left: "35%", top: "47%", width: "16%" },
			plantTransform: "translate(-10%, -95%)",
			plantPosition: { width: "9.5%" },
			plantNarrow: { width: "18%" },
			plantMobile: { width: "20%" },
		},
		{
			key: "stick",
			pot: "normal",
			position: { left: "56%", top: "60%", width: "7%" },
			narrow: { left: "65%", top: "50%", width: "10%" },
			mobile: { left: "67%", top: "47%", width: "12%" },
			plantTransform: "translate(-10%, -85%)",
			plantPosition: { width: "8%" },
			plantNarrow: { width: "13%" },
			plantMobile: { width: "15%" },
		},
		{
			key: "carrot",
			pot: "wide",
			position: { left: "63%", top: "78%", width: "14%" },
			narrow: { left: "72%", top: "70%", width: "25%" },
			mobile: { left: "75%", top: "67%", width: "30%" },
			plantTransform: "translate(18%, -97%)",
			plantPosition: { width: "10%" },
			plantNarrow: { width: "20%" },
			plantMobile: { width: "20%" },
		},
		{
			key: "dandelion",
			pot: "wide",
			position: { left: "75%", top: "67%", width: "12%" },
			narrow: { left: "88%", top: "58%", width: "20%" },
			mobile: { left: "93%", top: "55%", width: "20%" },
			plantTransform: "translate(10%, -90%)",
			plantPosition: { width: "15%" },
			plantNarrow: { width: "23%" },
			plantMobile: { width: "25%" },
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
		background-image: url("/assets/experiences/leaf/background.png");
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		background-color: #144237;
	}
</style>
