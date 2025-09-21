<script lang="ts">
    import {
        RhythmRenderer,
        type RhythmNote,
    } from "$lib/components/rhythm/RhythmRenderer.svelte";
    import Background from "$lib/components/rhythm/Background.svelte";
    import ScalableFrame from "$lib/components/maze/UI/ScalableFrame.svelte";
    import { onDestroy, untrack } from "svelte";
    import { parseBeatMap } from "$lib/components/rhythm/CanvasTools";
    import {
        rhythmGameConfig,
        createGameActionButton,
    } from "$lib/components/shared/slideshowConfig";
    import { GameState } from "$lib/components/rhythm/RhythmGameState.svelte";
    import SlideShow from "../shared/SlideShow.svelte";

    let canvas: HTMLCanvasElement | undefined;

    const renderer = $derived.by(() => {
        if (!canvas) {
            return undefined;
        }
        return new RhythmRenderer(canvas);
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
</script>

<ScalableFrame style="flex:1;">
    {#if GameState.isGamePre}
        <SlideShow
            slides={rhythmGameConfig.instructions.slides}
            title={rhythmGameConfig.instructions.title}
            show={true}
            actionButton={createGameActionButton(
                "start",
                () => {
                    GameState.startGame();
                },
                GameState.isGameRunning,
            )}
            showCloseButton={false}
        />
    {/if}

    {#if GameState.isGameEnded}
        <SlideShow
            slides={rhythmGameConfig.ending.slides}
            title={rhythmGameConfig.ending.title}
            show={true}
            showScore={GameState.score}
            gameResult={"win"}
            actionButton={createGameActionButton("restart", () => {               
                GameState.startGame();   
            })}
        />
    {/if}
    <div class="uistuff">
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
    .uistuff {
        position: absolute;
        top: 100px;
        left: 50%;

        transform: translate(-50%, 0);

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
</style>
