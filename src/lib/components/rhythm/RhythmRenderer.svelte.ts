import { component as Component, cQuad, cCricle, cImg, type RenderPkg as RenderPkg } from "./CanvasTools";

enum trackIds {
    top = 0,
    middle = 1,
    bottom = 2
}

const trackXPos = 0.125;
const trackYPositions = [0.625, 0.725, 0.825]
const trackWidth = 0.065;
const trackLength = 0.75;

const btnPos = 0.75;
const btnColors = ["FF9D9D", "DFFFBE", "F9E8A5"];

const cloudSpawnPos: number = 0.2;
const cloudDespawnPos: number = 0.8;

const interactionThreshold = 280;
const vfxDuration = 200;

function getTime(time: number = 0) {
    return Date.now() - time;
}

interface RhythmNote {
    trackNo: number;
    timing: number;
    duration: number;
}

const testSong =
    `test
1
0, 50
0, 75
0, 100
1, 100
2, 100`

let beatMap = testSong.split("\n")
beatMap = beatMap.filter((_, i) => {
    return i > 1
})
var beatsList: RhythmNote[] = beatMap.map(note => {
    let nInfo = note.split(", ")
    const n: RhythmNote = {
        trackNo: parseInt(nInfo[0]),
        timing: parseInt(nInfo[1]),
        duration: nInfo.length > 2 ? parseInt(nInfo[2]) : 0
    }
    return n;
})

export class RhythmRenderer {

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    pkg: RenderPkg;
    startTime: number = 0;

    songData: RhythmNote[];
    beatIndex: number = 0;

    staticObjs: Component[] = [];
    cloudObjs: Component[] = [];
    vfxObjs: Component[] = [];

    dpr = 1;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.pkg = {
            ctx: this.ctx,
            w: canvas.width,
            h: canvas.height
        }

        this.songData = beatsList; //default
        this.resetStats();

        this.init();
    }

    renderHandle = -1
    init() {
        this.renderHandle = requestAnimationFrame(this.eventLoop.bind(this));
        this.setupEnvironment();
        this.setupEvents();
    }

    setSong(data: RhythmNote[]) {
        this.songData = data;
    }

    resetStats() {
        this.startTime = Date.now();
        this.beatIndex = 0;
    }

    setupEvents() {
        this.canvas.addEventListener("keypress", (e) => {
            switch (e.key.toLowerCase()) {
                case "a":
                    this.keyDown(trackIds.top);
                    break;
                case "s":
                    this.keyDown(trackIds.middle);
                    break;
                case "d":
                    this.keyDown(trackIds.bottom);
                    break;
            }
        }, { capture: true });

        const handleResize = () => {
            const box = this.canvas.getBoundingClientRect();
            this.dpr = window.devicePixelRatio;
            this.pkg.ctx = this.ctx;
            this.pkg.w = box.width * this.dpr;
            this.pkg.h = box.height * this.dpr;

            this.canvas.width = this.pkg.w;
            this.canvas.height = this.pkg.h;
        }

        const resizeObserver = new ResizeObserver((entries) => {
            for (const e of entries) {
                handleResize();
            }
        });
        resizeObserver.observe(this.canvas);
        handleResize();

    }

    setupEnvironment() {
        //backboard
        this.staticObjs.push(
            new cQuad(this.pkg, 0.1, 0.58, 0.8, 0.37, "fill", () => {
                this.ctx.fillStyle = "black";
                this.ctx.globalAlpha = 0.4;
            })
        );

        //tracks
        trackYPositions.forEach(pos => {
            this.staticObjs.push(
                new cQuad(this.pkg, trackXPos, pos, trackLength, trackWidth, "fill", () => {
                    this.ctx.strokeStyle = "white";
                    this.ctx.lineWidth = 1.5;
                    this.ctx.globalAlpha = 0.4;
                }),
                new cQuad(this.pkg, trackXPos, pos, trackLength, trackWidth, "stroke", () => {
                    this.ctx.strokeStyle = "white";
                    this.ctx.lineWidth = 1.5;
                    this.ctx.globalAlpha = 1;
                })
            )
        });

        //button indicators
        trackYPositions.forEach((yPos, i) => {
            this.staticObjs.push(
                new cCricle(this.pkg, btnPos, yPos + trackWidth / 2, trackWidth / 2 - .01, () => {
                    this.ctx.lineWidth = 0.1;
                    this.ctx.fillStyle = "#" + btnColors[i];
                    this.ctx.globalAlpha = 1;
                })
            )
        });
    }

    keyDown(index: number) {
        const boundSize = interactionThreshold / 2;
        // let line = Math.floor((trackLength - cloudSpawnPos) / (cloudDespawnPos - cloudSpawnPos) * animFrames);
        // let lBound = line - boundSize;
        // let rBound = line + boundSize;

        let hit: boolean = false;

        // this.cloudObjs.forEach((c) => {

        // })

        let vfx = new cImg(this.pkg, trackLength - .025, trackYPositions[index] + .0125, [hit ? "hit" : "miss"])
        vfx.startTime = getTime(0);
        this.vfxObjs.push(vfx);
    }

    lastTime = 0;
    delta = 0;
    eventLoop(time: number) {
        this.delta = time - this.lastTime;

        this.render();
        this.renderHandle = requestAnimationFrame(this.eventLoop.bind(this));
        this.lastTime = time;
    }

    destroy() {
        cancelAnimationFrame(this.renderHandle);
    }

    render() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.pkg.w, this.pkg.h);
        this.ctx.scale(1 / this.dpr, 1 / this.dpr);

        this.staticObjs.forEach(obj => {
            obj.update();
        });
        this.vfxObjs.forEach(obj => {
            obj.update();
        });
        this.vfxObjs = this.vfxObjs.filter(v => {
            return getTime(v.startTime) < vfxDuration
        })

        this.ctx.restore();
    }
}