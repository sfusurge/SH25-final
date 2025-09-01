<script>
    import HoverEffectButton from '$lib/components/landing/HoverEffectButton.svelte';
    import BlockPatternVertical from '$lib/components/landing/svgs/BlockPatternVertical.svelte';
    import RockFilter from '$lib/components/landing/RockFilter.svelte';

    export let onChangeBackground = null;

</script>

<div class="mt-auto mb-8 relative border border-border bg-background h-11">
    <RockFilter />
    <div class="flex justify-between items-center h-full">
        <BlockPatternVertical class="h-11 mr-1.5" />

        <HoverEffectButton
                class="cursor-pointer w-[24px] h-[24px] mr-3"
                on:click={onChangeBackground}
        >
            <img
                    src="/assets/swap-background.svg"
                    alt="mode"
                    width="22"
                    height="22"
                    style="width: 22px"
                    data-demon="primary"
            />
        </HoverEffectButton>

        <HoverEffectButton
                class="cursor-pointer w-[24px] h-[24px]"
]        >
                <img
                        src="/assets/eye-open.svg"
                        alt="mode"
                        width="22"
                        height="22"
                        style="width: 22px"
                        data-demon="primary"
                />

        </HoverEffectButton>

        <BlockPatternVertical class="h-11 rotate-180 ml-1.5" />
    </div>
</div>