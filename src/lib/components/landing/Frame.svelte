<script lang="ts">
    import Diamond from "$lib/components/landing/svgs/Diamond.svelte";
    import { fade } from "svelte/transition";

    interface Props {
        mobile?: boolean;
        mobileStyle?: string;
        src: string;
    }

    let loading = $state(true);
    $effect(() => {
        if (src) {
            loading = true;
        }
    });
    let { mobile = false, src, mobileStyle = "" }: Props = $props();

    $inspect(mobile ? mobileStyle : "");
</script>

<svelte:head>
    <link rel="preload" href="/assets/frame.svg" as="image" type="image/svg+xml" />
</svelte:head>

<div class="inset-0 relative parent" class:mobile>
    {#key src}
        <div
            class="content"
            transition:fade={{ duration: 300 }}
            style="opacity: {loading ? 0 : 1};"
            class:mobile
        >
            {#if src.endsWith("mp4")}
                <!-- video content -->
                <video
                    src={src ?? ""}
                    autoplay
                    loop
                    muted
                    playsinline
                    onloadeddata={() => {
                        loading = false;
                    }}
                    style={mobile ? mobileStyle : ""}
                ></video>
            {:else}
                <!-- image content -->
                <img
                    src={src ?? ""}
                    onloadeddata={() => {
                        loading = false;
                    }}
                    style={mobile ? mobileStyle : ""}
                />
            {/if}
        </div>
    {/key}
    <div class="cover" class:mobile>
        <Diamond height={32} width={24} />
    </div>

    {#if !mobile}
        <img
            src="/assets/frame.svg"
            class="object-contain absolute inset-0 pointer-events-none z-10 w-full h-auto"
            loading="eager"
            fetchpriority="high"
        />
    {/if}
</div>

<style>
    .parent {
        height: auto;
        width: auto;
        max-width: 100%;
        display: flex;
        aspect-ratio: calc(872 / 511);
        margin: 2rem;
    }

    .parent.mobile {
        margin: 0;
        flex: 1;
        min-height: 0;
        width: 100%;
        aspect-ratio: unset;
        overflow: hidden;
    }
    .content {
        width: calc(100% - (2 * 2.87%));
        max-width: 100%;
        /* margin: 2.87%; */

        position: absolute;
        left: 2.87%;
        top: 2.87%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;

        transition: opacity 300ms ease-out;

        video,
        img {
            width: 100%;
            height: auto;
            object-fit: contain;
        }
    }

    .content.mobile {
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        transform: translate(0, 0);

        video,
        img {
            height: 100%;
            width: auto;
            object-fit: cover;
            margin: 0 auto;
        }
    }

    .cover.mobile {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        aspect-ratio: unset;
    }

    .cover {
        background-color: var(--color-background);
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        left: 2.87%;
        top: 2.87%;
        width: calc(100% - (2 * 2.87%));
        aspect-ratio: calc(872 / 511);
        /* transform: translate(0, -50%); */
        z-index: 1;
    }
</style>
