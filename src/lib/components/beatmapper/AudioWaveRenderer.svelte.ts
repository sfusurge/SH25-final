import { untrack } from "svelte";

export function getTimeString(time: number) {
    const t = Math.floor(time);
    const m = `${Math.floor(t / 60)}`.padStart(2, "0");
    const s = `${t % 60}`.padStart(2, "0");
    const ms = Math.floor(
        (time - t) * 1000,
    );
    return `${m}:${s}.${ms}`;
}

export const Shared = $state({
    hoverTime: 0,
    startTime: 0,
    endTime: 0,
    currentTime: 0
})


export class WaveRenderer {

    sampleRate: number;
    sampleChunkSize: number;
    chunks: Float32Array;

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    width: number = $state(0);
    height: number;

    pointer = $state({
        x: 0,
        y: 0,
        timer: 0
    })

    startTime: number = $state(0);
    endTime: number = $state(0);
    currentTime: number = $state(0);
    indicatorX: number = $derived(((this.currentTime - this.startTime) / (this.endTime - this.startTime)) * this.width);

    bpm: number = 1;
    bpmOffset: number = 0; // in seconds

    // length of audio in seconds
    duration: number;

    needRender = true;

    constructor(canvas: HTMLCanvasElement) {
        this.sampleChunkSize = 0;
        this.sampleRate = 0;
        this.chunks = new Float32Array(0);

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.width = canvas.width;
        this.height = canvas.height;

        // # derived
        this.duration = 0;

        this.init();

        $effect(() => {
            // disgusting jank
            Shared.startTime = this.startTime;
            Shared.endTime = this.endTime;
            Shared.hoverTime = this.pointer.timer;
            Shared.currentTime = this.currentTime;
        })
    }

    updateSamples(sampleRate: number, sampleChunkSize: number, chunks: Float32Array) {
        this.sampleRate = sampleRate;
        this.sampleChunkSize = sampleChunkSize;
        this.chunks = chunks;

        this.duration = (chunks.length * sampleChunkSize) / sampleRate;

        this.startTime = 0;
        this.endTime = this.duration;

        this.needRender = true;
    }

    updateBpm(bpm: number, bpmOffset: number) {
        this.bpm = bpm;
        this.bpmOffset = bpmOffset;
        this.needRender = true;

        console.log(bpm, bpmOffset);
    }

    /**
     * 
     * @param t 
     * @returns chunk index, integer, index-able
     */
    timeToChunk(t: number) {
        return Math.floor((t / this.duration) * this.chunks.length);
    }

    /**
     * 
     * @param c 
     * @returns time in seconds, as a float
     */
    chunkToTime(c: number) {
        return Math.floor((c / this.chunks.length)) * this.duration;
    }

    /**
     * converts offsetX to time
     * @param x 
     */
    pointToTime(x: number) {
        return ((x / this.width) * (this.endTime - this.startTime)) + this.startTime;
    }

    timeToPoint(t: number) {
        return ((t - this.startTime) / (this.endTime - this.startTime)) * this.width;
    }


    /**
     * zooms in/out around center
     * @param factor 
     * @param center as a percentage
     */
    zoom(factor: number, center: number) {
        center = Math.min(Math.max(center, 0), this.duration);

        const rangeChange = 1 + factor;
        const range = this.endTime - this.startTime;
        const newRange = range * rangeChange;
        const dr = (newRange - range) / 2;

        const oldCenter = this.startTime + range / 2;
        const newCenter = oldCenter + Math.min(Math.abs(dr), Math.abs(center - oldCenter)) * Math.sign(center - oldCenter);

        this.startTime = Math.max(newCenter - newRange / 2, 0);
        this.endTime = Math.min(newCenter + newRange / 2, this.duration);

        this.needRender = true;
    }

    renderHandle = -1;
    init() {
        this.renderHandle = requestAnimationFrame(this.eventloop.bind(this));
        this.setupEvents();
    }

    shift(offset: number) {
        this.startTime = Math.max(0, Math.min(this.duration, this.startTime + offset));
        this.endTime = Math.max(0, Math.min(this.duration, this.endTime + offset));

        this.needRender = true;
    }

    mouseDown = false;
    setupEvents() {
        // zoom
        this.canvas.addEventListener("wheel", (e) => {
            this.zoom(Math.sign(e.deltaY) * this.delta, (e.offsetX / this.width) * (this.endTime - this.startTime) + this.startTime)
        });

        // hover 
        this.canvas.addEventListener("mousemove", (e) => {
            this.pointer = {
                x: e.offsetX,
                y: e.offsetY,
                timer: (e.offsetX / this.width) * (this.endTime - this.startTime) + this.startTime
            };


            if (e.buttons & 4) {
                this.shift(-(e.movementX / this.width) * (this.endTime - this.startTime));
            }
        });

        this.canvas.addEventListener("click", (e) => {
            this.currentTime = this.pointToTime(e.offsetX);
        });

        document.addEventListener("keyup", (e) => {
            if (e.key === "ArrowLeft") {
                this.shift(-1);
            }

            if (e.key === "ArrowRight") {
                this.shift(1);
            }
        })


    }

    lastTime = 0;
    delta = 0;
    eventloop(currentTime: number) {
        // update delta time, aka frame time
        this.delta = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.width = this.canvas.width;
        this.height = this.canvas.height;


        // do updates and render logic...
        this.render();

        // request next frame
        this.renderHandle = requestAnimationFrame(this.eventloop.bind(this))
    }

    detroy() {
        cancelAnimationFrame(this.renderHandle);
    }


    render() {
        if (!this.needRender) {
            return;
        }
        this.needRender = false;

        this.ctx.clearRect(0, 0, this.width, this.height);

        // render bpm markers
        const timePerBeat = 60 / this.bpm;
        console.log(timePerBeat);

        const bpmGap = this.width / ((this.endTime - this.startTime) / timePerBeat);

        if (bpmGap > 10) {
            this.ctx.strokeStyle = "#3d3331";
            this.ctx.lineWidth = 2;
            for (let b = ((timePerBeat - (this.startTime % timePerBeat)) / timePerBeat) * bpmGap + (this.bpmOffset * bpmGap); b < this.width; b += bpmGap) {
                this.ctx.beginPath();
                this.ctx.moveTo(b, 0);
                this.ctx.lineTo(b, this.height);
                this.ctx.stroke();
            }
        }


        // renders wave form
        this.ctx.strokeStyle = "#5d4e4b";
        this.ctx.lineWidth = 2;
        this.ctx.lineJoin = "round";

        const startChunk = this.timeToChunk(this.startTime);
        const endChunk = this.timeToChunk(this.endTime) + 1;
        const chunkDiff = endChunk - startChunk;

        const points = 600;

        const gap = this.width / points;

        const halfHeight = this.height * 0.5;

        this.ctx.beginPath();
        this.ctx.moveTo(0, halfHeight);

        for (let c = 0; c < points; c++) {
            const chunk = this.chunks[Math.floor((c / points) * chunkDiff) + startChunk];
            const flip = c % 2 == 0;
            this.ctx.lineTo(c * gap, halfHeight + (chunk * halfHeight * (flip ? 1 : -1)));
        }

        this.ctx.stroke();
    }
}