<script lang="ts">
    import {
        getTimeString,
        WaveRenderer,
    } from "$lib/components/beatmapper/AudioWaveRenderer.svelte";
    import { onMount } from "svelte";

    interface Props {
        bpm: number;
        bpmOffset: number;
        file?: File;
    }

    let { bpm, bpmOffset, file }: Props = $props();

    const actx = new window.AudioContext();

    async function processFile(file?: File) {
        const samplePercentage = 0.005; // divide each second of audio into 200 chunks

        if (!file) {
            return {
                sampleRate: 0,
                sampleChunkSize: 0,
                buffer: [] as unknown as Float32Array<ArrayBuffer>,
            };
        }

        const buffer = await file.arrayBuffer();
        const decoded = await actx.decodeAudioData(buffer);

        const sampleRate = decoded.sampleRate;
        const sampleChunkSize = Math.floor(sampleRate * samplePercentage);
        const chunksCount = Math.floor(decoded.length / sampleChunkSize);

        const _buffer = decoded.getChannelData(0);
        const output = new Float32Array(chunksCount);

        // set output to be average each chunk for visual representation
        for (let c = 0; c < chunksCount; c++) {
            const offset = c * sampleChunkSize;

            let avg = 0;
            for (let s = offset; s < offset + sampleChunkSize; s++) {
                avg += Math.abs(_buffer[s]);
            }
            output[c] = avg / sampleChunkSize;
        }

        return {
            buffer: output,
            sampleRate,
            sampleChunkSize,
            chunksCount,
        };
    }

    const { sampleRate, sampleChunkSize, buffer, chunksCount } = $derived(await processFile(file));
    let canvas: HTMLCanvasElement | undefined = $state();

    const renderer = $derived.by(() => {
        if (!canvas) {
            return undefined;
        }
        return new WaveRenderer(canvas);
    });

    $effect(() => {
        renderer?.updateSamples(sampleRate, sampleChunkSize, buffer);
    });

    $effect(() => {
        renderer?.updateBpm(bpm, bpmOffset);
    });

    let audioPlayer: HTMLAudioElement | undefined = $state();
    let paused = $state(false);

    $effect(() => {
        if (audioPlayer && file) {
            audioPlayer.src = URL.createObjectURL(file);
        }
    });

    onMount(() => {
        document.addEventListener("keypress", (e) => {
            if ((e.target as Node).nodeName === "INPUT") {
                return;
            }
            if (e.key === " ") {
                paused = !paused;
            }
        });
    });
</script>

{#snippet TimerLabel(time: number, x: number, y: number)}
    {#if time > 0}
        <div class="label" style="--x: {x}px; --y: {y}px;">
            {getTimeString(time)}
        </div>
    {/if}
{/snippet}

<div class="canvasContainer">
    {@render TimerLabel(renderer?.pointer.timer ?? 0, renderer!.pointer.x, renderer!.pointer.y)}
    <div class="cursorIndicator" style="--x: {renderer?.pointer.x ?? 0}px"></div>
    <div
        class="cursorIndicator"
        style="--x:{renderer?.indicatorX}px; border-color: var(--orange);"
    ></div>
    <canvas bind:this={canvas} width="1000" height="300"></canvas>
</div>

<p>
    Start: {getTimeString(renderer?.startTime ?? 0)}, End: {getTimeString(renderer?.endTime ?? 0)}
</p>

{#if renderer}
    <audio bind:currentTime={renderer.currentTime} bind:this={audioPlayer} bind:paused></audio>
{/if}

<button
    onclick={() => {
        paused = !paused;
    }}
    >{paused ? "Play" : "Pause"}
</button>

<style>
    button,
    input {
        padding: 0.5rem;
        border: 1px solid var(--border);
        margin: 0.25rem;
    }
    canvas {
        border: 1px solid var(--border);
        background-color: var(--bg2);
    }

    .label {
        position: absolute;
        left: var(--x);
        top: var(--y);

        padding: 0.25rem;
        border: 1px solid var(--border);
        background-color: var(--bg);

        transform: translate(0.25rem, -100%);

        pointer-events: none;
    }

    .cursorIndicator {
        position: absolute;
        left: var(--x);
        top: 0;

        height: 100%;
        border-left: 1px solid var(--red);

        pointer-events: none;
    }

    .canvasContainer {
        position: relative;
        overflow: hidden;

        display: flex;
        width: fit-content;
    }
</style>
