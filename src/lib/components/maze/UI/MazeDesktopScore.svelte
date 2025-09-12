<script lang="ts">
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";
    import { global } from "../../../../routes/+layout.svelte";
    import { scoreStore } from "$lib/components/maze/gameData/MazeGameData";
</script>

{#if !global.mobile}
    <div class="mt-auto mb-8 relative border border-border bg-background h-11" data-maze-ui>
        <RockFilter />
        <div class="flex justify-between items-center h-full w-40">
            <BlockPatternVertical className="h-11 mr-2" />
            <div class="flex items-center gap-2">
                <img src="/assets/diamond.svg" alt="Score Icon" height="15" width="16" />
                <span
                    class="text-primary text-sm font-normal leading-normal opacity-100"
                    style="font-family: var(--font-catriel);">{$scoreStore}</span
                >
            </div>
            <BlockPatternVertical className="h-11 rotate-180 ml-2" />
        </div>
    </div>
{/if}
