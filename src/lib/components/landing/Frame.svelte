<script lang="ts">
    import { currentBackground } from "$lib/sharedStates/background.svelte.js";
    import Diamond from "$lib/components/landing/svgs/Diamond.svelte";

    interface Props {
        mobile:boolean;
    }

    let { mobile }: Props = $props();

    let loading = $state(true);
    let imageUrl = $state("");


    $effect(() => {
        loading = true;
        if (imageUrl) {
            setTimeout(() => {
                imageUrl = currentBackground.val;
            }, 300);
        } else {
            imageUrl = "";
        }
    });
</script>

<!-- CurrentBackgroundMobile equivalent -->
{#if mobile}
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
                onload={() => {
                    loading = false;
                }}
            />
        {/if}

        {#if loading}
            <div
                class="absolute inset-0 flex items-center justify-center bg-[var(--color-background)]"
            >
                <Diamond height={32} width={24} />
            </div>
        {/if}
    </div>
{:else}
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
					width: calc(100% - (2 * 2.87%));
					max-width: 100%;
					object-fit: contain;
					margin: 2.87%;
					opacity: {loading ? 0 : 1};
					position: relative;
					z-index: 2;
				"
                onload={()=>{loading = false;}}
            />
        {/if}

        <div
            style="
				background-color: var(--color-background);
				display: flex;
				justify-content: center;
				align-items: center;
				position: absolute;
				left: 2.87%;
				top: 50%;
				width: calc(100% - (2 * 2.87%));
				aspect-ratio: calc(872/511);
				transform: translate(0, -50%);
				z-index: 1;
			"
        >
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
{/if}
