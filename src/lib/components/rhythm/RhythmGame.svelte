<script lang="ts">
    import {
        RhythmRenderer,
        type RhythmNote,
    } from "$lib/components/rhythm/RhythmRenderer.svelte";
    import Background from "$lib/components/rhythm/Background.svelte";
    import ScalableFrame from "$lib/components/maze/UI/ScalableFrame.svelte";
    import { onDestroy, untrack, onMount } from "svelte";
    import { parseBeatMap } from "$lib/components/rhythm/CanvasTools";
    import {
        rhythmGameConfig,
        createGameActionButton,
    } from "$lib/components/shared/slideshowConfig";
    import { GameState } from "$lib/components/rhythm/RhythmGameState.svelte";
    import SlideShow from "../shared/SlideShow.svelte";
    import HoverEffectButton from "../landing/HoverEffectButton.svelte";
    import BlockPatternVertical from "../landing/svgs/BlockPatternVertical.svelte";
    import RockFilter from "../landing/svgs/RockFilter.svelte";
    import { global } from "../../../routes/+layout.svelte";

    let canvas: HTMLCanvasElement | undefined;

    let musicFile: FileList | undefined | null = $state();
    let beatmapFile: FileList | undefined | null = $state();
    let songTestMode: boolean = $state(false);

    const testSongUpload = () => {
        songTestMode = true;
    };

    const renderer = $derived.by(() => {
        if (!canvas) {
            return undefined;
        }
        return new RhythmRenderer(canvas, window.innerWidth <= 800);
    });

    let displayScore = $state(0);
    let otterState = $state("idle");
    let lastTime = 0;
    let gameStarted = $state(false);

    $effect(() => {
        if (renderer?.points !== undefined) {
            displayScore = renderer.points;
        }

        if (renderer?.otter_state !== undefined) {
            otterState = renderer.otter_state;
        }
    });

    const updateIdleFrame = (timestamp: number) => {
        if (timestamp - lastTime >= 1000) {
            if (otterState === "idle" || otterState === "idle2") {
                otterState = otterState == "idle" ? "idle2" : "idle";
            }
            lastTime = timestamp;
        }
        requestAnimationFrame(updateIdleFrame);
    };

    onMount(() => {
        requestAnimationFrame(updateIdleFrame);
    });

    onDestroy(() => {
        renderer?.destroy();
    });

    $effect(() => {
        renderer;
    });

    const songs: {
        [title: string]: {
            notesSrc: string;
            songSrc: string;
            notes?: RhythmNote[];
            song?: AudioBuffer;
        };
    } = $state({
        // "BAD APPLE": {
        //     notesSrc: "/rhythm/beatmaps/BAD_APPLE_TH4.beatmap",
        //     songSrc: "/rhythm/beatmaps/BAD_APPLE_TH4.mp3",
        // },
        "Philosophical Starry": {
            notesSrc: "/rhythm/beatmaps/Philosophical Starry [Easy].beatmap",
            songSrc: "/rhythm/beatmaps/philosophicalStarry.mp3",
        },
        "Scummious Realization": {
            notesSrc:
                "/rhythm/beatmaps/Scummious_ Realization [Medium].beatmap",
            songSrc: "/rhythm/beatmaps/scummiousRealization.mp3",
        },
        "Stormy & Sparky Training Arc": {
            notesSrc:
                "/rhythm/beatmaps/Stormy&Sparky_s Training Arc [Hard].beatmap",
            songSrc: "/rhythm/beatmaps/stormy&sparkysTrainingArc.mp3",
        },
    });

    let selectedSongTitle: string = $state("");

    $effect(() => {
        if (selectedSongTitle && selectedSongTitle !== "") {
            untrack(() => {
                // impure state skill diffed 😔
                const song = songs[selectedSongTitle];

                if (song.notes && song.song) {
                    renderer?.setSong(song.notes!, song.song!);
                    return;
                }

                Promise.all([fetch(song.notesSrc), fetch(song.songSrc)])
                    .then(async ([notesRes, songRes]) => {
                        const text = await notesRes.text();
                        // TODO, do something with title, difficulty
                        const { notes, difficulty, title } = parseBeatMap(text);
                        song.notes = notes;

                        const ctx = new window.AudioContext();
                        const music = await songRes.blob();
                        const buffer = await music.arrayBuffer();
                        song.song = await ctx.decodeAudioData(buffer);
                    })
                    .then(() => {
                        renderer?.setSong(song.notes!, song.song!);
                    });
            });
        }
        if (musicFile && beatmapFile && songTestMode == true) {
            untrack(() => {
                // impure state skill diffed 😔
                let song: {
                    notes?: RhythmNote[];
                    song?: AudioBuffer;
                } = {
                    notes: undefined,
                    song: undefined,
                };
                Promise.all([beatmapFile?.item(0)!, musicFile?.item(0)!])
                    .then(async ([notesRes, songRes]) => {
                        const text = await notesRes.text();
                        // TODO, do something with title, difficulty
                        const { notes, difficulty, title } = parseBeatMap(text);
                        song.notes = notes;

                        const ctx = new window.AudioContext();
                        const buffer = await songRes.arrayBuffer();
                        song.song = await ctx.decodeAudioData(buffer);
                    })
                    .then(() => {
                        renderer?.setSong(song.notes!, song.song!);
                    });
            });
        }
    });

    // Only start song if game is running and song data is loaded
    $effect(() => {
        const songDataLength = renderer?.songData.length ?? 0; // add songDataLength check to trigger effect
        // when changes happen.
        if (
            GameState.isGameRunning &&
            renderer &&
            renderer.songData.length > 0
        ) {
            gameStarted = true;
            renderer.startCountDown();
            canvas?.focus();
        }
    });

    function pause() {
        renderer?.pauseGame();
        GameState.pauseGame();
    }

    function resume() {
        renderer?.resumeGame();
        GameState.resumeGame();
    }

    function cleanupGame() {
        renderer?.reset();
        gameStarted = false;
        selectedSongTitle = "";
    }

    onDestroy(() => {
        cleanupGame();
    });
</script>

<div style="flex:1; display:flex; width:100%; height:100%; position:relative;">
    {#if GameState.isGamePre || GameState.showInstructionsDuringGame}
        <SlideShow
            slides={rhythmGameConfig.instructions.slides}
            title={rhythmGameConfig.instructions.title}
            show={true}
            actionButton={createGameActionButton(
                "start",
                () => {
                    if (GameState.isGameRunning) {
                        GameState.showInstructionsDuringGame = false;
                        GameState.resumeGame();
                        resume();
                    } else {
                        GameState.startGame();
                    }
                },
                GameState.isGameRunning,
            )}
            showCloseButton={GameState.showCloseButtonInInstructions}
            onClose={() => {
                GameState.showInstructionsDuringGame = false;
                GameState.showCloseButtonInInstructions = false;
                resume();
            }}
        />
    {/if}

    {#if GameState.isGameEnded}
        <SlideShow
            slides={rhythmGameConfig.ending.slides}
            title={rhythmGameConfig.ending.title}
            show={GameState.isGameEnded}
            showScore={renderer?.points}
            gameResult={!renderer
                ? null
                : renderer.points < renderer.lowScoreThreshold
                  ? "lose"
                  : renderer.points > renderer.highScoreThreshold
                    ? "win"
                    : null}
            actionButton={createGameActionButton("restart", () => {
                gameStarted = false;
                renderer?.reset();
                GameState.startGame();
                selectedSongTitle = "";
            })}
        />
    {/if}
    <ScalableFrame style="flex:1;">
        {#if !gameStarted}
            {#if !global.mobile}
                <div class="uistuff songSelection flex">
                    <BlockPatternVertical className="h-11" />
                    <span class="w-40 text-center">Pick your song</span>
                    <BlockPatternVertical className="h-11 rotate-180 ml-2" />
                </div>

                <div class="songs">
                    {#each Object.entries(songs) as [title] (title)}
                        <HoverEffectButton
                            className="w-full h-11 px-3 bg-[#060605] text-[#8A6F6A] text-[14px] truncate"
                            onClick={() => {
                                selectedSongTitle = title;
                                // gameStarted = true;
                            }}
                        >
                            {title}
                        </HoverEffectButton>
                    {/each}
                </div>
            {:else}
                <div class="mobileSongSelection">
                    <label class="mobileLabel" for="songOption">
                        <!-- TODO: placeholder, remove -->

                        Pick your song:
                        <select
                            name="songOption"
                            id="songOption"
                            bind:value={selectedSongTitle}
                        >
                            {#each Object.entries(songs) as [title, song], index (title)}
                                <option value={title}>{title}</option>
                            {/each}
                        </select>
                    </label>
                </div>
            {/if}
        {/if}

        <Background />
        <img class="cloud" src="/rhythm/pinkCloud.webp" alt="cloud" />
        <canvas tabindex="1" bind:this={canvas}></canvas>

        <div style="position: absolute; left: 20px; top: 20px;;">
            <HoverEffectButton
                className="h-11"
                onClick={() => {
                    if (GameState.isGameRunning) {
                        pause();
                        GameState.openInstructions(true);
                    }
                }}
                square
                large
            >
                <img class="icon" src="/rhythm/pause.png" alt="?" />
            </HoverEffectButton>
        </div>

        <div style="position: absolute; right: 20px; top: 20px;;">
            <div
                class="mt-auto mb-8 relative border border-border bg-background h-11"
            >
                <RockFilter />
                <div class="flex justify-between items-center h-full w-40">
                    <BlockPatternVertical className="h-11 mr-2" />
                    <div class="flex items-center gap-2">
                        <img
                            src="/assets/experiences/leaf/leafIcon.png"
                            alt="Score Icon"
                            height="15"
                            width="16"
                        />
                        <span
                            class="text-primary text-sm font-normal leading-normal opacity-100"
                            style="font-family: var(--font-catriel);"
                            >{displayScore}</span
                        >
                    </div>
                    <BlockPatternVertical className="h-11 rotate-180 ml-2" />
                </div>
            </div>
        </div>

        <img
            class="otter"
            src="/rhythm/{otterState === 'idle'
                ? 'pinkResting1'
                : otterState === 'idle2'
                  ? 'pinkResting2'
                  : otterState === 'hit'
                    ? 'pinkCorrectHit'
                    : 'pinkWrongHit'}.webp"
            alt="otter"
        />
    </ScalableFrame>
</div>

<style>
    .cloud {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -20%);
        z-index: 0;
        width: 30%;
    }

    .otter {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -70%);
        z-index: 0;
        width: 11%;
    }

    .songSelection {
        top: 80px;
        left: 50%;
        z-index: 11;
        transform: translate(-50%, 0);
    }

    .uistuff {
        position: absolute;
        background-color: var(--color-background);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .mobileLabel {
        margin-bottom: 1rem;
    }

    .mobileSongSelection {
        position: absolute;
        background-color: var(--color-background);
        padding: 1rem;
        top: 80px;
        left: 50%;
        z-index: 11;
        transform: translate(-50%, 0);
        width: 50%;
    }

    select {
        border: 1px solid var(--border);
        padding: 0.5rem;
        margin-top: 0.25rem;
        width: 100%;
    }

    .songs {
        position: absolute;
        top: 140px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 11;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
        width: 75%;
    }

    canvas {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 1;
        background-color: transparent;
    }


</style>
