<script>
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";
    import { backgrounds, currentBackgroundIndex } from "$lib/sharedStates/background.svelte.js";

    function changeBackground() {
        currentBackgroundIndex.update((index) => {
            return (index + 1) % $backgrounds.length;
        });
    }
</script>

<div class="mt-auto mb-8 relative border border-border bg-background h-11">
    <RockFilter />
    <div class="flex justify-between items-center h-full">
        <BlockPatternVertical className="h-11 mr-1.5" />

        <HoverEffectButton
            class="cursor-pointer w-full h-[24px] text-sm bg-[#06060599]"
            onClick={changeBackground}
        >
            Swap Background
        </HoverEffectButton>

        <BlockPatternVertical className="h-11 rotate-180 ml-1.5" />
    </div>
</div>
