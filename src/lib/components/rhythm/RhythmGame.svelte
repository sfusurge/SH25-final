<script lang="ts">
    import {
        RhythmRenderer,
        type RhythmNote,
    } from "$lib/components/rhythm/RhythmRenderer.svelte";
    import Background from "$lib/components/rhythm/Background.svelte";
    import ScalableFrame from "$lib/components/maze/UI/ScalableFrame.svelte";
    import { onDestroy, untrack } from "svelte";
    import { cImg, parseBeatMap } from "$lib/components/rhythm/CanvasTools";
    import {
        rhythmGameConfig,
        createGameActionButton,
    } from "$lib/components/shared/slideshowConfig";
    import { GameState } from "$lib/components/rhythm/RhythmGameState.svelte";
    import SlideShow from "../shared/SlideShow.svelte";
    import HoverEffectButton from "../landing/HoverEffectButton.svelte";

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
            duration?: number;
        };
    } = $state({
        "BAD APPLE": {
            notesSrc: "/rhythm/beatmaps/BAD_APPLE_TH4.beatmap",
            songSrc: "/rhythm/beatmaps/BAD_APPLE_TH4.mp3",
        },
    });

    let selectedSongTitle: string = $state("");

    $effect(() => {
        if (selectedSongTitle && selectedSongTitle !== "") {
            untrack(() => {
                // impure state skill diffed 😔
                const song = songs[selectedSongTitle];

                if (song.notes && song.song && song.duration) {
                    renderer?.setSong(song.notes!, song.song!, song.duration!);
                    return;
                }

                Promise.all([fetch(song.notesSrc), fetch(song.songSrc)])
                    .then(async ([notesRes, songRes]) => {
                        const text = await notesRes.text();
                        // TODO, do something with title, difficulty
                        const { notes, duration, title } = parseBeatMap(text);
                        song.notes = notes;
                        song.duration = duration;

                        const ctx = new window.AudioContext();
                        const music = await songRes.blob();
                        const buffer = await music.arrayBuffer();
                        song.song = await ctx.decodeAudioData(buffer);
                    })
                    .then(() => {
                        renderer?.setSong(
                            song.notes!,
                            song.song!,
                            song.duration!,
                        );
                    });
            });
        }
        if (musicFile && beatmapFile && songTestMode == true) {
            untrack(() => {
                // impure state skill diffed 😔
                let song: {
                    notes?: RhythmNote[];
                    song?: AudioBuffer;
                    duration?: number;
                } = {
                    notes: undefined,
                    song: undefined,
                    duration: undefined,
                };
                Promise.all([beatmapFile?.item(0)!, musicFile?.item(0)!])
                    .then(async ([notesRes, songRes]) => {
                        const text = await notesRes.text();
                        // TODO, do something with title, difficulty
                        const { notes, duration, title } = parseBeatMap(text);
                        song.notes = notes;
                        song.duration = duration;

                        const ctx = new window.AudioContext();
                        const buffer = await songRes.arrayBuffer();
                        song.song = await ctx.decodeAudioData(buffer);
                    })
                    .then(() => {
                        renderer?.setSong(
                            song.notes!,
                            song.song!,
                            song.duration!,
                        );
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
            renderer.startSong();
        }
    });

    function pause() {
        renderer?.pauseGame();
        GameState.pauseGame();
    }

    function resume() {
        renderer?.resumeGame();
    }
</script>

<ScalableFrame style="flex:1;">
    <div class="pause">
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
                GameState.resumeGame();
                resume();
            }}
        />
    {/if}

    {#if GameState.isGameEnded}
        <SlideShow
            slides={rhythmGameConfig.ending.slides}
            title={rhythmGameConfig.ending.title}
            show={true}
            showScore={renderer?.points}
            gameResult={!renderer
                ? null
                : renderer.points < 20
                  ? "lose"
                  : renderer.points > 100
                    ? "win"
                    : null}
            actionButton={createGameActionButton("restart", () => {
                GameState.startGame();
            })}
        />
    {/if}
    <div class="uistuff beatMapInput">
        <label>
            <!-- TODO: placeholder, remove -->

            Beatmap:
            <input accept=".beatmap" bind:files={beatmapFile} type="file" />
        </label>
    </div>

    <div class="uistuff songFileInput">
        <label>
            <!-- TODO: placeholder, remove -->

            SongMp3:
            <input accept=".mp3" bind:files={musicFile} type="file" />
        </label>
    </div>

    {#if beatmapFile && musicFile}
        <div class="uistuff testSong" on:click={testSongUpload}>Test</div>
    {/if}

    <div class="uistuff songSelection">
        <label for="songOption">
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

    <Background />
    <canvas tabindex="1" bind:this={canvas}></canvas>
</ScalableFrame>

<style>
    .beatMapInput {
        top: 250px;
        left: 10%;
        font-size: 0.75vw;

        ::file-selector-button {
            border: 1px white solid;
            padding: 0 5px;
            cursor: pointer;
        }
    }

    .songFileInput {
        top: 250px;
        left: 40%;
        font-size: 0.75vw;

        ::file-selector-button {
            border: 1px white solid;
            padding: 0 5px;
            cursor: pointer;
        }
    }

    .testSong {
        top: 250px;
        left: 70%;
        cursor: pointer;
        font-size: 0.75vw;
    }

    .songSelection {
        top: 100px;
        left: 50%;

        transform: translate(-50%, 0);
    }

    .uistuff {
        position: absolute;
        background-color: var(--color-background);
        padding: 1rem;
    }

    select {
        border: 1px solid var(--border);
        padding: 0.5rem;
    }

    canvas {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
    }

    .pause {
        margin: 1%;
    }
</style>
