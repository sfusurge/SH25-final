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

    let paused = $state(true);
    let audioRef = $state<HTMLAudioElement>();
    let lock = $state(true);
    let showMusicSelector = $state(false);
    let showAmbianceMenu = $state(false);
    let currentTime = $state(0);
    let duration = $state(1);
    let progressPercent = $derived(currentTime / duration);

    function handleProgressChange(val: string) {
        const newProgress = parseInt(val);
        const newTime = (newProgress / 100) * duration;
        audioRef!.currentTime = newTime;
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

    function togglePlayPause() {
        paused != paused;
        lock = false;
    }
</script>

<audio
    src={!lock ? currentTrack.file : ""}
    bind:this={audioRef}
    bind:paused
    bind:currentTime
    bind:duration
    volume={masterVolume.volume}
    onended={() => {
        // TODO play next
    }}
></audio>

<!-- DESKTOP -->
<div
    class="hidden sm:block mt-auto mb-4 relative border border-border bg-background sm:w-[80%] xl:w-[70%] h-[43px]"
>
    <RockFilter />
    <div class="flex justify-between h-full">
        <div class="flex flex-row gap-2">
            <BlockPatternVertical />
            <div class="flex items-center justify-center gap-4">
                <div class="flex flex-row gap-2">
                    <div class="self-center relative flex">
                        <HoverEffectButton
                            className="w-[24px] h-[24px]"
                            onClick={() => (showMusicSelector = !showMusicSelector)}
                        >
                            <img
                                data-demon="primary"
                                src="/assets/music.svg"
                                height="16"
                                width="16"
                                alt="Play"
                                style="height: 16px"
                            />
                        </HoverEffectButton>
                        {#if showMusicSelector}
                            <MusicTypeSelectorDialog onClose={() => (showMusicSelector = false)} />
                        {/if}
                    </div>

                    <div class="flex flex-col w-32">
                        <ScrollingText
                            text={currentTitle}
                            className="text-[12px] text-main font-bold"
                        />
                        <ScrollingText text={currentArtist} className="text-[10px] text-primary" />
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-row gap-2">
            <div class="self-center relative flex">
                {#if showAmbianceMenu}
                    <AmbianceDialog onClose={() => (showAmbianceMenu = !showAmbianceMenu)} />
                {/if}
                <HoverEffectButton
                    onClick={() => (showAmbianceMenu = !showAmbianceMenu)}
                    className="self-center w-[24px] h-[24px]"
                >
                    <img
                        data-demon="primary"
                        src="/assets/sound.svg"
                        height="16"
                        width="16"
                        alt="Sound"
                        style="height: 16px"
                    />
                </HoverEffectButton>
            </div>
            <BlockPatternVertical className="h-[43px] w-[11px] bg-repeat-y rotate-180" />
        </div>
    </div>

    <div
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-4"
    >
        <Diamond width={8} height={14} />
        <div class="flex items-center justify-center gap-4">
            <HoverEffectButton
                className="cursor-pointer w-[24px] h-[24px]"
                onClick={() => {
                    PlayerState.trackIndex--;
                    paused = false;
                    lock = false;
                }}
            >
                <img
                    data-demon="primary"
                    src="/assets/prev.svg"
                    height="12"
                    width="12"
                    alt="Previous"
                />
            </HoverEffectButton>

            <HoverEffectButton
                className="cursor-pointer w-[24px] h-[24px]"
                onClick={togglePlayPause}
            >
                <img
                    data-demon="primary"
                    src={paused ? "/assets/play.svg" : "/assets/pause.svg"}
                    height="12"
                    width="12"
                    alt={paused ? "Play" : "Pause"}
                    style="height: 16px"
                />
            </HoverEffectButton>

            <HoverEffectButton
                className="cursor-pointer w-[24px] h-[24px]"
                onClick={() => {
                    PlayerState.trackIndex++;
                    paused = false;
                    lock = false;
                }}
                style="transform: scale(-1, 1)"
            >
                <img
                    data-demon="primary"
                    src="/assets/prev.svg"
                    height="12"
                    width="12"
                    alt="Next"
                />
            </HoverEffectButton>
        </div>

        <!-- Progress Bar -->
        <div class="flex items-center gap-2">
            <span class="text-xs text-primary font-mono">{formatTime(currentTime)}</span>
            <div class="sliderWrapper w-53" style="--progress: {progressPercent / 100}">
                <input
                    type="range"
                    min="0"
                    max="100"
                    class="slider"
                    value={progressPercent}
                    oninput={(e) => {
                        handleProgressChange(e.currentTarget.value);
                    }}
                />
            </div>
            <span class="text-xs text-primary font-mono">{formatTime(duration)}</span>
        </div>

        <Diamond width={8} height={14} />
    </div>
</div>

<style>
    .sliderWrapper {
        position: relative;
        height: 0.5rem;
        display: flex;
        width: 100%;
    }

    .slider {
        width: 100%;
        height: 0.5rem;
        position: relative;
        border: 1px solid var(--color-primary);
        box-sizing: border-box;
        -webkit-appearance: none;
        z-index: 2;
        cursor: pointer;
        background: transparent;
    }

    .sliderWrapper::after {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: calc(100% * var(--progress));
        background-color: var(--color-primary);
        pointer-events: none;
        z-index: 0;
    }

    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 1rem;
        height: 1rem;
        background: transparent;
        cursor: pointer;
    }

    .slider::-moz-range-thumb {
        width: 1rem;
        height: 1rem;
        background: transparent;
        border: none;
        cursor: pointer;
    }
</style>
