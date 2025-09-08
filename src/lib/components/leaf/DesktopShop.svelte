<script lang="ts">
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";
    import { isMobile } from "$lib/components/leaf/gameData/layout";
    import {
        openShop,
        gamePhase,
    } from "$lib/components/leaf/gameData/LeafGame";
</script>

{#if !$isMobile}
    <div class="mt-auto mb-8 relative border border-border bg-background h-11">
        <RockFilter />
        <div class="flex justify-between items-center h-full w-40">
            <BlockPatternVertical className="h-11 mr-1.5" />

            <HoverEffectButton
                className="cursor-pointer w-20 h-6 px-1 bg-[#06060599] text-[#8A6F6A] text-[12px]"
                onClick={$gamePhase === "running" ? openShop : undefined}
            >
                View Shop
            </HoverEffectButton>

            <BlockPatternVertical className="h-11 rotate-180 ml-1.5" />
        </div>
    </div>
{/if}
