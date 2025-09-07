<script lang="ts">
    import Diamond from "$lib/components/landing/svgs/Diamond.svelte";
    import { fade } from "svelte/transition";

    interface Props {
        mobile?: boolean;
        src: string;
    }

    let { mobile = false, src }: Props = $props();
</script>

<svelte:head>
    <link rel="preload" href="/assets/frame.svg" as="image" type="image/svg+xml" />
</svelte:head>

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
    {#key src}
        <div class="content" transition:fade={{ duration: 300 }}>
            {#if src.endsWith("mp4")}
                <!-- video content -->

                <video src={src ?? ""} autoplay loop muted playsinline></video>
            {:else}
                <!-- image content -->

                <img src={src ?? ""} />
            {/if}
        </div>
    {/key}
    <div class="cover">
        <Diamond height={32} width={24} />
    </div>

    <img
        src="/assets/frame.svg"
        class="object-contain absolute inset-0 pointer-events-none z-10 w-full h-full"
        loading="eager"
        fetchpriority="high"
    />
</div>

<style>
    .content {
        width: calc(100% - (2 * 2.87%));
        max-width: 100%;
        /* margin: 2.87%; */

        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;

        video,
        img {
            width: 100%;
            height: auto;
            object-fit: contain;
        }
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
