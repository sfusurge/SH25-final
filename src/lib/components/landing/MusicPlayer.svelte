<script>
    import { onMount, onDestroy } from 'svelte';
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
    import MusicTypeSelectorDialog from '$lib/components/landing/MusicTypeSelectorDialog.svelte';
    import AmbianceDialog from '$lib/components/landing/AmbianceDialog.svelte';
    import { masterVolume } from '$lib/stores/ambiance.js';
    import ScrollingText from '$lib/components/landing/ScrollingText.svelte';
    import RockFilter from '$lib/components/landing/RockFilter.svelte';

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

    $: currentTrack = $musicLib[$trackIndex];
    $: currentTitle = currentTrack?.title || '';
    $: currentArtist = currentTrack?.artist || '';

    $: if (audioRef && $masterVolume !== undefined) {
        audioRef.volume = $masterVolume;
    }

    $: if (currentTrack && audioRef && !isLoading) {
        handleTrackChange();
    }

    async function handleTrackChange() {
        if (!audioRef || isLoading) return;

        if (isPlaying && audioRef.paused) {
            if (audioRef.src !== currentTrack.file) {
                audioRef.src = currentTrack.file;
            }

            try {
                await audioRef.play();
                isPlaying = true;
            } catch (error) {
                console.log('Play interrupted:', error);
                isPlaying = false;
            }
        } else if (!isPlaying && !audioRef.paused) {
            audioRef.pause();
        }
    }

    async function togglePlayPause() {
        if (!audioRef) return;

        isLoading = true;

        if (isPlaying) {
            audioRef.pause();
            isPlaying = false;
        } else {
            if (initialPlay) {
                initialPlay = false;
                audioRef.src = currentTrack.file;
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

    function playNext() {
        isLoading = true;
        const nextIndex = ($trackIndex + 1) % $musicLib.length;
        trackIndex.set(nextIndex);
        isPlaying = true;
        isLoading = false;
    }

    function playPrevious() {
        isLoading = true;
        const prevIndex = $trackIndex === 0 ? $musicLib.length - 1 : $trackIndex - 1;
        trackIndex.set(prevIndex);
        isPlaying = true;
        isLoading = false;
    }

    function handleAudioEnded() {
        isPlaying = false;
        playNext();
    }

    function handleAudioPlay() {
        isPlaying = true;
    }

    function handleAudioPause() {
        isPlaying = false;
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
                        on:click={() => (showMusicSelector = !showMusicSelector)}
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
                        on:click={playPrevious}
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
                        on:click={togglePlayPause}
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
                        on:click={playNext}
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
                        on:click={() => (showAmbianceMenu = !showAmbianceMenu)}
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
    <div class="hidden sm:block mt-auto mb-4 relative border border-border bg-background sm:w-[80%] xl:w-[50%] h-[43px]">
        <RockFilter />
        <div class="flex justify-between h-full">
            <div class="flex flex-row gap-2">
                <BlockPatternVertical />
                <div class="flex items-center justify-center gap-4">
                    <div class="flex flex-row gap-2">
                        <div class="self-center relative flex">
                            <HoverEffectButton
                                    className="w-[24px] h-[24px]"
                                    on:click={() => (showMusicSelector = !showMusicSelector)}
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
                            on:click={() => (showAmbianceMenu = !showAmbianceMenu)}
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
                        on:click={playPrevious}
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
                        on:click={togglePlayPause}
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
                        on:click={playNext}
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
            <Diamond width={8} height={14} />
        </div>
    </div>
{/if}