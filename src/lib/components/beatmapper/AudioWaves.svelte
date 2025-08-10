<script lang="ts">
    import { WaveRenderer } from "$lib/components/beatmapper/AudioWaveRenderer.svelte";

    interface Props {
        bpm: number;
        bpmOffset: number;
        file?: File;
    }

    let { bpm, bpmOffset, file }: Props = $props();

    const actx = new window.AudioContext();

    async function processFile() {
        const samplePercentage = 0.01; // divide each second of audio into 100 chunks

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

    const { sampleRate, sampleChunkSize, buffer, chunksCount } = $derived(await processFile());
    let canvas: HTMLCanvasElement | undefined = $state();
    $inspect(canvas, sampleRate, sampleChunkSize, buffer, chunksCount);
    const renderer = $derived.by(() => {
        if (!canvas) {
            return undefined;
        }
        return new WaveRenderer(canvas, sampleRate, sampleChunkSize, buffer);
    });
    $inspect(renderer)
</script>

<canvas bind:this={canvas} width="1000" height="300"></canvas>

<style>
    canvas {
        border: 1px solid var(--border);
        background-color: var(--bg2);
    }
</style>
