<script lang="ts">
    import { currentBackground } from "$lib/sharedStates/background.svelte.js";
    import Diamond from "$lib/components/landing/svgs/Diamond.svelte";

    interface Props {
        mobile?: boolean;
    }

    let { mobile = false }: Props = $props();

    let loading = $state(true);
    let imageUrl = $state("");

    $effect(() => {
        loading = true;
        if (currentBackground.val) {
            setTimeout(() => {
                imageUrl = currentBackground.val;
            }, 300);
        } else {
            imageUrl = "";
        }
    });
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
    {#if imageUrl}
        <img
            src={imageUrl}
            alt="background"
            style="
                opacity: {loading ? 0 : 1};
			"
            class="content"
            onload={() => {
                // loading = false;
            }}
        />
    {/if}

    <div class="cover">
        <Diamond height={32} width={24} />
    </div>

    <img
        src="/assets/frame.svg"
        alt="frame"
        class="object-contain absolute inset-0 pointer-events-none z-10 w-full h-full"
        loading="eager"
        data-demon="border"
    />
</div>

<style>
    .content {
        width: calc(100% - (2 * 2.87%));
        max-width: 100%;
        object-fit: contain;
        margin: 2.87%;

        position: relative;
        z-index: 2;

        width: 600px;
    }
    .cover {
        background-color: var(--color-background);
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        left: 2.87%;
        top: 50%;
        width: calc(100% - (2 * 2.87%));
        aspect-ratio: calc(872 / 511);
        transform: translate(0, -50%);
        z-index: 1;
    }
</style>
