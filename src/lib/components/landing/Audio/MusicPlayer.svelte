<script lang="ts">
    import { PlayerState } from "$lib/sharedStates/music.svelte.js";

    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";
    import Diamond from "$lib/components/landing/svgs/Diamond.svelte";
    import MusicTypeSelectorDialog from "$lib/components/landing/Audio/MusicTypeSelectorDialog.svelte";
    import AmbianceDialog from "$lib/components/landing/Audio/AmbianceDialog.svelte";
    import { masterVolume } from "$lib/sharedStates/ambiance.svelte.js";
    import ScrollingText from "$lib/components/landing/Audio/ScrollingText.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";
    import { tick } from "svelte";

    let paused = $state(true);
    let audioRef = $state<HTMLAudioElement>();
    let lock = $state(true);
    let showMusicSelector = $state(false);
    let showAmbianceMenu = $state(false);
    let currentTime = $state(0);
    let duration = $state(1);
    let progressPercent = $derived((currentTime / duration) * 100);

    function handleProgressChange(val: string) {
        const newProgress = parseInt(val);
        const newTime = (newProgress / 100) * duration;
        currentTime = newTime;
    }

    function formatTime(seconds: number) {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    let currentTrack = $derived(PlayerState.currentTrack);
    let currentTitle = $derived(currentTrack.title || "");
    let currentArtist = $derived(currentTrack.artist || "");

    async function togglePlayPause() {
        lock = false;
        await tick();
        paused = !paused;
    }

    async function play() {
        lock = false;
        await tick();
        paused = false;
    }
</script>

<audio
    src={!lock ? currentTrack.file : ""}
    bind:this={audioRef}
    bind:paused
    bind:duration
    bind:currentTime
    volume={masterVolume.volume}
    onended={() => {
        // TODO play next
    }}
></audio>

<div class="mt-auto mb-4 relative border border-border bg-background">
    <RockFilter />
    <BlockPatternVertical />

    <div>
        <HoverEffectButton
            square
            onClick={() => {
                showMusicSelector = !showMusicSelector;
            }}
        >
            <img src="/assets/music.svg" alt="Select Music Type" />
        </HoverEffectButton>

        {#if showMusicSelector}
            <MusicTypeSelectorDialog
                onClose={() => {
                    showMusicSelector = false;
                }}
            />
        {/if}
    </div>

    <div class="ver">
        <ScrollingText text={currentTitle} style="color: var(--header); font-style: italic;" />
        <ScrollingText text={currentArtist} style="font-style:italic;" />
    </div>

    <div class="hor">
        <Diamond width="8" height="14" />

        <!-- prev -->
        <HoverEffectButton
            square
            onClick={() => {
                PlayerState.trackIndex--;
                play();
            }}
        >
            <img class="icon" src="/assets/prev.svg" alt="Previous Song" />
        </HoverEffectButton>
        <!-- play -->

        <HoverEffectButton square onClick={togglePlayPause}>
            <img class="icon" src="/assets/play.svg" alt="Play Song" />
        </HoverEffectButton>

        <!-- next -->
        <HoverEffectButton
            square
            onClick={() => {
                PlayerState.trackIndex++;
                play();
            }}
        >
            <img
                class="icon"
                src="/assets/prev.svg"
                alt="Next Sng"
                style="transform: scale(-1, 1);"
            />
        </HoverEffectButton>

        <Diamond width="8" height="14" />
    </div>
    o
    <BlockPatternVertical />
</div>

<style>
    .hor {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .ver {
        display: flex;
        flex-direction: column;
    }

    img {
        width: 16px;
        height: 16px;
    }

    img.icon {
        width: 12px;
        height: 12px;
    }
</style>
