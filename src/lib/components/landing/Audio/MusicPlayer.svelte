<script>
    import { writable, derived } from 'svelte/store';
    import {
        calmMusicLibrary,
        epicMusicLibrary,
        specialMusicLibrary,
        ambianceLibrary
    } from '$lib/stores/audioLibrary.js';
    import HoverEffectButton from '$lib/components/landing/HoverEffectButton.svelte';
    import BlockPatternVertical from '$lib/components/landing/svgs/BlockPatternVertical.svelte';
    import Diamond from '$lib/components/landing/svgs/Diamond.svelte';
    import MusicTypeSelectorDialog from '$lib/components/landing/Audio/MusicTypeSelectorDialog.svelte';
    import AmbianceDialog from '$lib/components/landing/Audio/AmbianceDialog.svelte';
    import { masterVolume } from '$lib/stores/ambiance.js';
    import ScrollingText from '$lib/components/landing/Audio/ScrollingText.svelte';
    import RockFilter from '$lib/components/landing/svgs/RockFilter.svelte';

    export const trackIndex = writable(0);
    export const currentLibType = writable('calm');

    export const musicLibOptions = {
        calm: calmMusicLibrary,
        epic: epicMusicLibrary,
        special: specialMusicLibrary,
        ambiance: ambianceLibrary,
    };

    function shuffleArr(arr) {
        for (let i = arr.length - 1; i > -1; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[j], arr[i]] = [arr[i], arr[j]];
        }
        return arr;
    }

    const _musicLib = writable(shuffleArr([...musicLibOptions.calm]));
    export const musicLib = derived(_musicLib, ($lib) => $lib);

    export function setMusicLibrary(variant) {
        const newLib = [...musicLibOptions[variant]];
        shuffleArr(newLib);
        _musicLib.set(newLib);
        trackIndex.set(0);
        currentLibType.set(variant);
    }

    let isPlaying = false;
    let audioRef;
    let initialPlay = true;
    let isLoading = false;
    let showMusicSelector = false;
    let showAmbianceMenu = false;
    let currentTime = 0;
    let duration = 0;
    let progressPercent = 0;

    $: currentTrack = $musicLib[$trackIndex];
    $: currentTitle = currentTrack?.title || '';
    $: currentArtist = currentTrack?.artist || '';

    $: if (audioRef && $masterVolume !== undefined) {
        audioRef.volume = $masterVolume;
    }

    $: progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    $: if (currentTrack && audioRef) {
        handleTrackChange();
    }

    async function handleTrackChange() {
        if (!audioRef || !currentTrack) return;

        if (audioRef.src !== currentTrack.file) {
            audioRef.src = currentTrack.file;
            audioRef.load();
            currentTime = 0;
            duration = 0;
        }

        if (isPlaying) {
            try {
                await audioRef.play();
            } catch (error) {
                console.log('Play interrupted:', error);
                isPlaying = false;
            }
        }
    }

    async function togglePlayPause() {
        if (!audioRef || !currentTrack) return;

        isLoading = true;

        if (isPlaying) {
            audioRef.pause();
            isPlaying = false;
        } else {
            if (initialPlay || audioRef.src !== currentTrack.file) {
                initialPlay = false;
                audioRef.src = currentTrack.file;
                audioRef.load();
            }

            try {
                await audioRef.play();
                isPlaying = true;
            } catch (error) {
                console.log('Play failed:', error);
                isPlaying = false;
            }
        }

        isLoading = false;
    }

    async function playNext() {
        if (!audioRef) return;

        const nextIndex = ($trackIndex + 1) % $musicLib.length;
        trackIndex.set(nextIndex);

        // Don't manipulate isLoading here - let the reactive statement handle the change
        // If we were playing, continue playing the new track
        if (isPlaying) {
            // The reactive statement will handle the actual track change and playback
        }
    }

    async function playPrevious() {
        if (!audioRef) return;

        const prevIndex = $trackIndex === 0 ? $musicLib.length - 1 : $trackIndex - 1;
        trackIndex.set(prevIndex);
        if (isPlaying) {
        }
    }

    function handleAudioEnded() {
        // Don't set isPlaying to false immediately, let playNext handle it
        playNext();
    }

    function handleAudioPlay() {
        isPlaying = true;
    }

    function handleAudioPause() {
        isPlaying = false;
    }

    function handleTimeUpdate() {
        if (audioRef) {
            currentTime = audioRef.currentTime;
        }
    }

    function handleLoadedMetadata() {
        if (audioRef) {
            duration = audioRef.duration;
        }
    }

    function handleProgressChange(e) {
        if (!audioRef || !duration) return;

        const newProgress = parseInt(e.target.value);
        const newTime = (newProgress / 100) * duration;
        audioRef.currentTime = newTime;
        currentTime = newTime;
    }

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
</script>



{#if $$props.trackInfoOnly}
    <div class="flex flex-col flex-1 min-w-0 pr-3 w-[20px]">
        <ScrollingText text={currentTitle} className="font-bold" />
        <ScrollingText text={currentArtist} className="font-primary" />
    </div>
{:else}
    <audio
            bind:this={audioRef}
            on:ended={handleAudioEnded}
            on:play={handleAudioPlay}
            on:pause={handleAudioPause}
            on:timeupdate={handleTimeUpdate}
            on:loadedmetadata={handleLoadedMetadata}
    ></audio>

    <!-- MOBILE -->
    <div class="sm:hidden w-full">
        <div class="flex justify-between items-center w-full gap-4">
            <MusicTypeSelectorDialog
                    show={showMusicSelector}
                    mobileMode
                    onClose={() => (showMusicSelector = false)}
            >
                <HoverEffectButton
                        slot="trigger"
                        onClick={() => (showMusicSelector = !showMusicSelector)}
                        className="flex-1 min-w-15 max-w-15"
                        style="aspect-ratio: 1"
                >
                    <img
                            src="/assets/music.svg"
                            height="24"
                            width="24"
                            alt="Music Library"
                            data-demon="primary"
                            class="w-[18px]"
                    />
                </HoverEffectButton>
            </MusicTypeSelectorDialog>

            <div class="flex flex-1 gap-4 justify-center">
                <HoverEffectButton
                        onClick={playPrevious}
                        className="flex-1 min-w-6 max-w-14"
                        style="aspect-ratio: 1"
                >
                    <img
                            src="/assets/prev.svg"
                            height="24"
                            width="24"
                            alt="Previous"
                            data-demon="primary"
                            class="w-[18px]"
                    />
                </HoverEffectButton>

                <HoverEffectButton
                        onClick={togglePlayPause}
                        className="flex-1 min-w-6 max-w-14"
                        style="aspect-ratio: 1"
                >
                    <img
                            data-demon="primary"
                            src={isPlaying ? '/assets/pause.svg' : '/assets/play.svg'}
                            height="24"
                            width="24"
                            alt={isPlaying ? 'Pause' : 'Play'}
                            style="height: 16px"
                    />
                </HoverEffectButton>

                <HoverEffectButton
                        onClick={playNext}
                        className="flex-1 min-w-6 max-w-14"
                        style="aspect-ratio: 1"
                >
                    <img
                            data-demon="primary"
                            src="/assets/prev.svg"
                            height="24"
                            width="24"
                            alt="Next"
                            class="w-[18px]"
                            style="transform: scale(-1, 1)"
                    />
                </HoverEffectButton>
            </div>

            <AmbianceDialog
                    mobileShow={showAmbianceMenu}
                    mobileMode
                    onClose={() => (showAmbianceMenu = false)}
            >
                <HoverEffectButton
                        slot="trigger"
                        onClick={() => (showAmbianceMenu = !showAmbianceMenu)}
                        className="flex-1 min-w-15 max-w-15"
                        style="aspect-ratio: 1"
                >
                    <img
                            data-demon="primary"
                            src="/assets/sound.svg"
                            height="24"
                            width="24"
                            alt="Sound"
                            class="w-[18px]"
                    />
                </HoverEffectButton>
            </AmbianceDialog>
        </div>
    </div>

    <!-- DESKTOP -->
    <div class="hidden sm:block mt-auto mb-4 relative border border-border bg-background sm:w-[80%] xl:w-[70%] h-[43px]">
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
                                <MusicTypeSelectorDialog
                                        onClose={() => (showMusicSelector = false)}
                                />
                            {/if}
                        </div>

                        <div class="flex flex-col w-32">
                            <ScrollingText
                                    text={currentTitle}
                                    className="text-[12px] text-main font-bold"
                            />
                            <ScrollingText
                                    text={currentArtist}
                                    className="text-[10px] text-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-row gap-2">
                <div class="self-center relative flex">
                    {#if showAmbianceMenu}
                        <AmbianceDialog
                                onClose={() => (showAmbianceMenu = !showAmbianceMenu)}
                        />
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

        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-4">
            <Diamond width={8} height={14} />
            <div class="flex items-center justify-center gap-4">
                <HoverEffectButton
                        className="cursor-pointer w-[24px] h-[24px]"
                        onClick={playPrevious}
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
                            src={isPlaying ? '/assets/pause.svg' : '/assets/play.svg'}
                            height="12"
                            width="12"
                            alt={isPlaying ? 'Pause' : 'Play'}
                            style="height: 16px"
                    />
                </HoverEffectButton>

                <HoverEffectButton
                        className="cursor-pointer w-[24px] h-[24px]"
                        onClick={playNext}
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
                            on:input={handleProgressChange}
                    />
                </div>
                <span class="text-xs text-primary font-mono">{formatTime(duration)}</span>
            </div>

            <Diamond width={8} height={14} />
        </div>
    </div>
{/if}

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