<script>
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";
    import RockFilter from "../../landing/svgs/RockFilter.svelte";
    import {
        gamePaused,
        toggleGamePause,
        openInstructions,
        gamePhase,
        focusGameCanvas,
    } from "$lib/components/maze/gameData/MazeGameData";

    function togglePlayPause() {
        toggleGamePause();
        focusGameCanvas();
    }
</script>

<!-- Mobile -->
<div
    class="flex flex-row gap-0 items-center border border-border bg-[#231f1f] w-full py-2 px-3 sm:hidden justify-between relative"
></div>

<div class="hidden sm:flex mt-auto mb-8 relative border border-border bg-[#231f1f] h-11">
    <RockFilter />
    <div class="flex justify-between items-center h-full">
        <BlockPatternVertical className="h-11 mr-1.5" />
        <HoverEffectButton
            className="cursor-pointer w-[24px] h-[24px] m-1"
            onClick={togglePlayPause}
        >
            <img
                data-demon="primary"
                src={$gamePaused ? "/assets/play.svg" : "/assets/pause.svg"}
                height="12"
                width="12"
                alt={$gamePaused ? "Play" : "Pause"}
                style="height: 16px"
            />
        </HoverEffectButton>

        <HoverEffectButton
            className="h-6 w-15 m-3 px-1 bg-[#06060599] text-[#8A6F6A] text-[12px] inline-flex items-center leading-none"
            onClick={() => {
                if ($gamePhase === "running") {
                    openInstructions();
                    focusGameCanvas();
                }
            }}
        >
            Rules
        </HoverEffectButton>
        <BlockPatternVertical className="h-11 rotate-180 ml-1.5" />
    </div>
</div>

<style>
</style>
