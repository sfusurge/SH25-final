<script>
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";
    import {
        backgrounds,
        currentBackground,
        toggleBackground,
    } from "$lib/sharedStates/background.svelte";
</script>

<div class="mt-auto relative border border-border bg-background h-11">
    <RockFilter />
    <div class="flex justify-between items-center h-full gap-1">
        <BlockPatternVertical className="h-11 mr-1.5" />

        <HoverEffectButton
            className="cursor-pointer w-full h-[24px] px-1 bg-[#06060599] text-[#8A6F6A] text-[12px]"
            onClick={() => {
                toggleBackground(false);
            }}
        >
            Swap Background
        </HoverEffectButton>

        <HoverEffectButton
            onClick={() => {
                toggleBackground(true);
            }}
            square
        >
            <img src="/assets/moon.svg" alt="" />
        </HoverEffectButton>

        <BlockPatternVertical className="h-11 rotate-180 ml-1.5" />
    </div>
</div>
