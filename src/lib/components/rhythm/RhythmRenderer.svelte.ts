import { GameMusicPlayer } from "$lib/components/rhythm/GmaeMusicPlayer.svelte";
import { component as Component, cQuad, cCricle, cImg, type RenderPkg as RenderPkg } from "./CanvasTools";

enum trackIds {
    top = 0,
    middle = 1,
    bottom = 2
}

export enum noteState {
    untouched = 0,
    caught = 1,
    missed = 2
}

const trackXPos = 0.125;
const trackYPositions = [0.625, 0.725, 0.825]
const trackWidth = 0.065;
const trackLength = 0.75;

const btnPos = 0.75;
const btnColors = ["FF9D9D", "DFFFBE", "F9E8A5"];

const cloudSpawnPercent: number = 0.1;
const cloudDespawnPercent: number = 0.9;
const cloudPresenceDuration = 3000;

const spriteNames = ["red clouds", "green clouds", "yellow clouds"]
const cloudSprites = spriteNames.map(sN => {
    let s: HTMLImageElement = new Image();
    s.src = `/rhythm/${sN}.webp`;
    return s;
})

const interactionThreshold = 280;
const vfxDuration = 200;



export interface RhythmNote {
    trackNo: number;
    timing: number;
    duration: number | undefined;
    noteState: noteState;
}



export class RhythmRenderer {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    pkg: RenderPkg;
    startTime: number = 0;

    songData: RhythmNote[] = $state([]);

    heldKeys: number[] = [];
    //tracks hold keys by index
    holdKeyTracker: number[] = [];

    staticObjs: Component[] = [];
    vfxObjs: Component[] = [];

    currentTime = 0;
    delta = 0;

    dpr = 1;
    resizeObserver: ResizeObserver | undefined;

    musicPlayer: GameMusicPlayer = new GameMusicPlayer();

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.pkg = {
            ctx: this.ctx,
            w: canvas.width,
            h: canvas.height
        }

        this.init();
    }

    renderHandle = -1
    init() {
        this.renderHandle = requestAnimationFrame(this.eventLoop.bind(this));
        this.setupEnvironment();
        this.setupEvents();
    }

    getTimeSince(time: number) {
        return this.currentTime - time;
    }

    eventLoop(time: number) {
        this.delta = (time - this.currentTime) / 1000;
        this.currentTime = time;

        this.render();
        this.renderHandle = requestAnimationFrame(this.eventLoop.bind(this));
    }

    setSong(notes: RhythmNote[], song: AudioBuffer) {
        this.musicPlayer.song = song;
        this.songData = notes;
        this.musicPlayer.play();
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

        this.resizeObserver = new ResizeObserver((entries) => {
            for (const e of entries) {
                handleResize();
            }
        });
        this.resizeObserver.observe(this.canvas);
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
        //bounds of button interact registration
        let lBound = this.musicPlayer.currentTime - boundSize;
        let rBound = this.musicPlayer.currentTime + boundSize;

        let hit: boolean = false;

        let i = 0;
        while(i < this.songData.length && this.songData[i].timing < rBound){
            let n = this.songData[i];
            if(n.timing < lBound || n.noteState == noteState.caught || n.trackNo != index){
                i++;
                continue;
            }
            n.noteState = noteState.caught;
            hit = true;
            break;
        }

        let vfx = new cImg(this.pkg, trackLength - .025, trackYPositions[index] + .0125, [hit ? "hit" : "miss"])
        vfx.startTime = this.musicPlayer.currentTime;
        this.vfxObjs.push(vfx);
    }


    destroy() {
        cancelAnimationFrame(this.renderHandle);
        this.resizeObserver?.disconnect();
    }

    render() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.pkg.w, this.pkg.h);
        this.ctx.scale(1 / this.dpr, 1 / this.dpr);

        this.renderEnv();
        this.renderClouds();
        this.renderVfx();

        this.ctx.restore();
    }

    renderEnv() {
        this.staticObjs.forEach(obj => {
            obj.update();
        });
    }

    renderClouds() {
        let cTime = this.musicPlayer.currentTime;

        // pos/percent of btn to screen, relative to length of track
        const btnTrackPercent = ((btnPos - cloudSpawnPercent) / (cloudDespawnPercent - cloudSpawnPercent));

        // portion time to percentage after the btns, make that lower bound
        const lowTime = cTime - cloudPresenceDuration * ( 1 - btnTrackPercent); 
        const highTime = cTime + cloudPresenceDuration * btnTrackPercent;

        const timeRange = highTime - lowTime;

        const withinTimeRange = (t: number) => {
            return t <= highTime && t >= lowTime;
        }

        const calcXByProgress = (prog: number, additionalShift: number = 0) => {
            return this.xStd(cloudSpawnPercent + prog * (cloudDespawnPercent - cloudSpawnPercent)) + additionalShift;
        }

        // let hKeyIdx = 0;
        // this.ctx.lineWidth = 10;
        // while(hKeyIdx < this.holdKeyTracker.length){
        //     let n = this.songData[hKeyIdx];
        //     if((n.duration! + n.timing) > highTime){
        //         this.holdKeyTracker.splice(hKeyIdx, 1);
        //         continue;
        //     }
        //     this.ctx.strokeStyle = `#${btnColors[n.trackNo]}`;
        //     let rPercent = n.timing < lowTime ? 1 : 1 - ((n.timing - lowTime) / timeRange);
        //     let rLineAnchor = calcXByProgress(rPercent);
        //     this.ctx.beginPath()
        //     let lineY = trackYPositions[n.trackNo] * this.canvas.height;
        //     this.ctx.moveTo(this.xStd(0.2), lineY);
        //     this.ctx.lineTo(rLineAnchor, lineY);
        //     this.ctx.stroke();
        //     hKeyIdx++;
        // }
        // this.ctx.lineWidth = 1;

        let visibleClouds: RhythmNote[] = this.songData.filter((n, i) => {
            return withinTimeRange(n.timing) && !this.holdKeyTracker.includes(i); // TODO maybe binary search start and end of visible region. LC medium lol.
        })
        this.ctx.lineWidth = 2;

        visibleClouds.forEach((v, i) => {
            if(v.duration != undefined){
                this.holdKeyTracker.push(i);
                return;
            }
            if(v.noteState == noteState.caught){
                return;
            }
            let prog = 1 - ((v.timing - lowTime) / timeRange); // left = 0%, right = 100%
            this.ctx.strokeStyle = "orange";
            let progDist = calcXByProgress(prog, -(cloudSprites[v.trackNo].width / 2));
            this.ctx.strokeRect(
                progDist,
                trackYPositions[v.trackNo] * this.canvas.height,
                cloudSprites[v.trackNo].width,
                cloudSprites[v.trackNo].height,
            )

            this.ctx.drawImage(
                cloudSprites[v.trackNo],
                progDist,
                trackYPositions[v.trackNo] * this.canvas.height
            )
        });

        this.ctx.strokeStyle = 'red';
        this.ctx.strokeRect(this.xStd(cloudSpawnPercent), this.yStd(trackYPositions[0]),
            this.xStd(cloudDespawnPercent - cloudSpawnPercent),
            this.yStd(trackYPositions[2] - trackYPositions[0])
        );

        this.ctx.strokeStyle = 'green';
        this.ctx.strokeRect(this.xStd(btnPos) - 5, this.yStd(trackYPositions[0]), 10, this.yStd(trackYPositions[2] - trackYPositions[0]))

    }

    renderVfx() {
        this.vfxObjs.forEach(obj => {
            obj.update();
        });
        this.vfxObjs = this.vfxObjs.filter(v => {
            return (this.musicPlayer.currentTime - v.startTime) < vfxDuration
        })
    }

    // getRightEdge(timing: number){
    //     if(this.songData[0].timing > timing){
    //         return -1;
    //     }
    //     let i = Math.floor(this.songData.length / 2);
    //     while(true){
    //         if(this.songData[i].timing <= timing && (i + 1 >= this.songData.length || this.songData[i + 1].timing > timing)){

    //         }
    //     }
    // }

    xStd(x: number) {
        return x * this.canvas.width;
    }

    yStd(y: number) {
        return y * this.canvas.height;
    }
}