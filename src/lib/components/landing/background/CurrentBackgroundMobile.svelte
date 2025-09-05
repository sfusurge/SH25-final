<script lang="ts">
    import { run } from 'svelte/legacy';

    import Diamond from '$lib/components/landing/svgs/Diamond.svelte';

    let { currentBackground } = $props();

    let loading = $state(true);
    let imageUrl = $state(undefined);


    async function handleBackgroundChange(newBackground) {
        loading = true;
        if (imageUrl) {
            setTimeout(() => {
                imageUrl = newBackground;
            }, 300);
        } else {
            imageUrl = newBackground;
        }
    }

    function handleImageLoad() {
        loading = false;
    }
    run(() => {
        if (currentBackground) {
            handleBackgroundChange(currentBackground);
        }
    });
</script>

<div class="relative w-full h-[75dvh]">
    {#if imageUrl}
        <img
                src={imageUrl}
                alt="background banner"
                height="1000"
                width="1800"
                class="object-cover w-full h-[75dvh]"
                loading="lazy"
                style="opacity: {loading ? 0 : 1}"
                onload={handleImageLoad}
        />
    {/if}

    {#if loading}
        <div class="absolute inset-0 flex items-center justify-center bg-[var(--color-background)]">
            <Diamond height={32} width={24} />
        </div>
    {/if}
</div>