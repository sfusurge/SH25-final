


export class WaveRenderer {

    sampleRate: number;
    sampleChunkSize: number;
    chunks: Float32Array;

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;


    startTime: number;
    endTime: number;

    // length of audio in seconds
    duration: number;

    needRender = true;

    constructor(canvas: HTMLCanvasElement, sampleRate: number, sampleChunkSize: number, chunks: Float32Array) {
        this.sampleChunkSize = sampleChunkSize;
        this.sampleRate = sampleRate;
        this.chunks = chunks;

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.width = canvas.width;
        this.height = canvas.height;

        // # derived
        this.duration = (chunks.length * sampleChunkSize) / sampleRate;

        this.startTime = 10;
        this.endTime = 20;

        console.log("Wave renderer created");

        this.init();
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

    renderHandle = -1;
    init() {
        this.renderHandle = requestAnimationFrame(this.eventloop.bind(this));
    }

    lastTime = 0;
    delta = 0;
    eventloop(currentTime: number) {
        // update delta time, aka frame time
        this.delta = currentTime - this.lastTime;
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

        // renders wave form
        this.ctx.strokeStyle = "#5d4e4b";
        this.ctx.lineWidth = 2;
        this.ctx.lineJoin = "round";

        const startChunk = this.timeToChunk(this.startTime);
        const endChunk = this.timeToChunk(this.endTime) + 1;

        const gap = this.width / (endChunk - startChunk);
        console.log(gap, endChunk - startChunk);

        const halfHeight = this.height * 0.5;

        this.ctx.beginPath();
        this.ctx.moveTo(0, halfHeight);

        for (let c = startChunk; c < endChunk; c++) {

            const flip = c % 2 == 0;
            this.ctx.lineTo((c - startChunk) * gap, halfHeight + (this.chunks[c] * halfHeight * (flip ? 1 : -1)));
        }

        this.ctx.stroke();
    }
}