<script lang="ts">
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";
    import { global } from "../../../routes/+layout.svelte";
    import {
        gamePhase,
        gameEndsAt,
        nowStore,
        GAME_DURATION_MS,
    } from "$lib/components/maze/gameData/MazeGameData";

    function fmt(ms: number) {
        const s = Math.floor(ms / 1000);
        const mm = String(Math.floor(s / 60)).padStart(2, "0");
        const ss = String(s % 60).padStart(2, "0");
        return `${mm}:${ss}`;
    }

    let sessionTimeLeftMs = $derived(
        $gamePhase === "running" && $gameEndsAt
            ? Math.max(0, $gameEndsAt - $nowStore)
            : $gamePhase === "ended"
              ? 0
              : GAME_DURATION_MS
    );
</script>

{#if !global.mobile}
    <div class="mt-auto mb-8 relative border border-border bg-background h-11 z-0">
        <RockFilter />
        <div class="flex justify-between items-center h-full w-40">
            <BlockPatternVertical className="h-11 mr-2" />
            <div class="flex items-center gap-2">
                <img src="/assets/clock.svg" height="15" width="16" alt="clock" />
                <span
                    class="text-primary text-sm font-normal leading-normal"
                    style="font-family: var(--font-catriel);">{fmt(sessionTimeLeftMs)}</span
                >
            </div>
            <BlockPatternVertical className="h-11 rotate-180 ml-2" />
        </div>
    </div>
{/if}
