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
    import Slider from "$lib/components/landing/Audio/Slider.svelte";

    let paused = $state(true);
    let audioRef = $state<HTMLAudioElement>();
    let lock = $state(true);
    let showMusicSelector = $state(false);
    let showAmbianceMenu = $state(false);
    let currentTime = $state(0);
    let duration = $state(1);
    let progressPercent = $derived((currentTime / duration) * 100);

    function handleProgressChange(val: number) {
        const newTime = (val / 100) * duration;
        currentTime = newTime;
    }

    function formatTime(seconds: number) {
        if (!seconds || isNaN(seconds)) return "-:--";
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
        PlayerState.trackIndex++;
        play();
    }}
></audio>

<div
    class="mt-auto mb-4 relative border border-border bg-background hor root"
    style="gap:0.75rem; justify-content: space-between;"
>
    <RockFilter />
    <BlockPatternVertical style={"align-self: stretch;"} />

    <div class="hor" style="gap:0.25rem; flex:1;">
        <div class="relative">
            <HoverEffectButton
                square
                onClick={() => {
                    showMusicSelector = !showMusicSelector;
                }}
            >
                <img src="/assets/music.svg" alt="Select Music Type" />
            </HoverEffectButton>

            <MusicTypeSelectorDialog
                show={showMusicSelector}
                onClose={() => {
                    showMusicSelector = false;
                }}
            />
        </div>

        <div class="ver titleGroup">
            <ScrollingText
                text={currentTitle}
                style="color: var(--header); font-style: italic; line-height: 1rem; font-size: 13px;"
            />
            <ScrollingText
                text={currentArtist}
                style="font-style:italic; line-height: 1rem; font-size:12px;"
            />
        </div>
    </div>

    <!-- center group -->
    <div class="hor" style="gap:0.5rem; flex:2; justify-content: center;">
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
            <img
                class="icon"
                src={paused ? "/assets/play.svg" : "/assets/pause.svg"}
                alt="Play Song"
            />
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

        <div class="hor" style="gap:0.25rem;">
            <span>
                {formatTime(currentTime)}
            </span>
            <Slider
                value={progressPercent}
                onChange={(newVal) => {
                    handleProgressChange(newVal);
                }}
            />
            <span>
                {formatTime(duration)}
            </span>
        </div>

        <Diamond width="8" height="14" />
    </div>

    <div class="relative" style="display:flex; flex:1; justify-content: flex-end;">
        <HoverEffectButton
            square
            onClick={() => {
                showAmbianceMenu = !showAmbianceMenu;
            }}
        >
            <img class="icon" src="/assets/sound.svg" alt="Ambiance Sound Menu" />
        </HoverEffectButton>

        <AmbianceDialog
            show={showAmbianceMenu}
            onClose={() => {
                showAmbianceMenu = false;
            }}
        ></AmbianceDialog>
    </div>

    <BlockPatternVertical style={"align-self: stretch;"} />
</div>

<style>
    span {
        font-family: "Fira Mono", monospace;
        font-size: 12px;
    }

    .root {
        height: 3rem;
        width: 100%;
        max-width: 1000px;
        margin: 0 2rem;
        margin-bottom: 2rem;
    }
    .hor {
        display: flex;
        flex-direction: row;
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

    .titleGroup {
        max-width: 150px;
        margin: 0 0.25rem;
    }

    span {
        white-space: nowrap;
        font-size: 12px;
    }
</style>
