<script lang="ts">
    import LeafGame from "./LeafGame.svelte";
</script>

<div
    class="inset-0 relative"
    style="
			height: 100%;
			width: auto;
			max-width: 100%;
			object-fit: contain;
			display: flex;
			aspect-ratio: calc(872/511);
		"
>
    <div
        style="
			position: absolute;
			left: 12%;
			top: 12%;
			right: 12%;
			bottom: 12%;
			z-index: 3;
			overflow: hidden;
		"
    >
        <div
            style="
			height: 100%;
			width: auto;
			max-width: 100%;
			object-fit: contain;
			display: flex;
			aspect-ratio: calc(872/511);
		"
        >
            <LeafGame />
        </div>
    </div>

    <img
        src="/assets/frame.svg"
        alt="frame"
        class="object-contain absolute inset-0 pointer-events-none z-10 w-full h-full"
        loading="eager"
        data-demon="border"
    />
</div>
