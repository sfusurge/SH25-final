import { GameMusicPlayer } from "$lib/components/rhythm/GmaeMusicPlayer.svelte";
import { component as Component, cQuad, cCricle, cImg, type RenderPkg as RenderPkg, getSrc, cText } from "./CanvasTools";
import { GamePhase, GameState } from "$lib/components/rhythm/RhythmGameState.svelte";

enum trackIds {
    top = 0,
    middle = 1,
    bottom = 2
}

export enum noteState {
    untouched = 0,
    caught = 1,
    held = 2,
    missed = 3
}

interface boundRange {
    min: number,
    max: number
}

const basePoints = 5;

const trackXPos = 0.125;
const trackYPositions = [0.625, 0.725, 0.825]
const trackWidth = 0.065;
const trackLength = 0.75;

const btnPos = 0.75;
const btnColors = ["FF9D9D", "DFFFBE", "F9E8A5"];
const btnLabels = ["A", "S", "D"];

const cloudSpawnPercent: number = 0.125;
const cloudDespawnPercent: number = 0.85;
const cloudPresenceDuration = 3000;

const spriteNames = ["red clouds", "green clouds", "yellow clouds"]
const cloudSprites = spriteNames.map(sN => {
    let s: HTMLImageElement = new Image();
    s.src = getSrc(sN);
    return s;
})

const interactionThreshold = 280;
const vfxDuration = 200;

const OTTER_IMG = ["pinkResting1", "pinkResting2", "pinkCorrectHit", "pinkWrongHit"] as const;

export interface RhythmNote {
    trackNo: number;
    timing: number;
    duration: number | undefined;
    noteState: noteState;
}



export class RhythmRenderer {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    mobileView: boolean;

    pkg: RenderPkg;
    startTime: number = 0;

    songData: RhythmNote[] = $state([]);

    empty = -1
    heldKeys: number[] = [this.empty, this.empty, this.empty];
    //tracks hold keys by index
    holdKeyTracker: number[] = [];

    staticObjs: Component[] = [];
    vfxObjs: Component[] = [];

    otter_index = -1;
    otter_timer = 0;
    otter_idle = 0;

    points: number = 0;
    addPoints(bonusMulti: number = 1) {
        this.points += basePoints * bonusMulti;
    }

    currentTime = 0;
    delta = 0;

    dpr = 1;
    resizeObserver: ResizeObserver | undefined;

    musicPlayer: GameMusicPlayer = new GameMusicPlayer();
    duration: number = 0;

    constructor(canvas: HTMLCanvasElement, mobileView: boolean) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.pkg = {
            ctx: this.ctx,
            w: canvas.width,
            h: canvas.height
        }
        this.mobileView = mobileView;

        this.reset();
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

    setSong(notes: RhythmNote[], song: AudioBuffer, duration: number) {
        this.musicPlayer.song = song;
        this.songData = notes;
        this.duration = duration;
    }

    startSong() {
        this.musicPlayer.play();
    }

    reset() {
        this.holdKeyTracker = [];
        this.heldKeys = [this.empty, this.empty, this.empty];
        this.holdKeyTracker = [];
        this.vfxObjs = [];
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

        this.canvas.addEventListener("keyup", (e) => {
            switch (e.key.toLowerCase()) {
                case "a":
                    this.keyUp(trackIds.top);
                    break;
                case "s":
                    this.keyUp(trackIds.middle);
                    break;
                case "d":
                    this.keyUp(trackIds.bottom);
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

        // cloud rendering
        this.staticObjs.push(
            new cImg(this.pkg, 0.35, 0.4, ["pinkCloud"], 0, () => {
                this.ctx.save();
                this.ctx.globalAlpha = 1;
            })
        );

        // otter
        this.otter_index = this.staticObjs.push(
            new cImg(this.pkg, 0.45, 0.3 - (7 / this.canvas.height), [...OTTER_IMG], 0)
        ) - 1;

        this.otter_idle = window.setInterval(() => {
            if (this.otter_index < 0) return;
            const cur = this.staticObjs[this.otter_index] as cImg;
            if (cur.currentSprite === 0) cur.currentSprite = 1;
            else if (cur.currentSprite === 1) cur.currentSprite = 0;
        }, 1000);

        //backboard
        this.staticObjs.push(
            new cQuad(this.pkg, 0.1, 0.58, 0.8, 0.37, "fill", () => {
                this.ctx.restore();
                this.ctx.fillStyle = "black";
                this.ctx.globalAlpha = 0.4;
            })
        );

        //tracks
        trackYPositions.forEach((yPos, i) => {
            this.staticObjs.push(
                new cQuad(this.pkg, trackXPos, yPos, trackLength, trackWidth, "fill", () => {

                    this.ctx.strokeStyle = "white";
                    this.ctx.lineWidth = 1.5;
                    this.ctx.globalAlpha = 0.4;
                }),
                new cQuad(this.pkg, trackXPos, yPos, trackLength, trackWidth, "stroke", () => {
                    this.ctx.strokeStyle = "white";
                    this.ctx.lineWidth = 1.5;
                    this.ctx.globalAlpha = 1;
                }),
                //button indicators
                new cCricle(this.pkg, btnPos, yPos + trackWidth / 2, trackWidth / 2 - .01, () => {
                    this.ctx.lineWidth = 0.1;
                    this.ctx.fillStyle = "#" + btnColors[i];
                    this.ctx.globalAlpha = 1;
                }),
                //button labels
                new cText(this.pkg, btnPos, yPos + trackWidth / 2 + .002, btnLabels[i])
            )
        });
    }

    keyDown(index: number) {
        if (this.heldKeys[index] != this.empty) {
            return;
        }
        let bounds: boundRange = this.getBounds(interactionThreshold);
        //bounds of button interact registration

        let hit: boolean = false;

        for (let i = 0; i < this.songData.length && this.songData[i].timing < bounds.max; i++) {
            let n = this.songData[i];
            if (n.timing < bounds.min || n.noteState == noteState.caught || n.trackNo != index) {
                continue;
            }
            if (n.duration != undefined) {
                this.heldKeys[n.trackNo] = i;
                n.noteState = noteState.held;
            } else {
                n.noteState = noteState.caught;
            }
            this.addPoints();
            hit = true;
            break;
        }

        this.addBtnVfx(index, hit);
        this.setOtter(hit ? 2 : 3, 200);
    }

    keyUp(track: number) {
        if (this.heldKeys[track] == this.empty) {
            return;
        }
        let bound = this.getBounds(interactionThreshold);
        let note = this.songData[this.heldKeys[track]];
        if ((note.timing + note.duration!) > bound.min && (note.timing + note.duration!) < bound.max) {
            this.addPoints(4)
            note.noteState = noteState.caught;
        } else {
            note.noteState = noteState.missed;
        }

        this.setOtter(note.noteState === noteState.caught ? 2 : 3);
        this.heldKeys[track] = this.empty;
    }

    destroy() {
        cancelAnimationFrame(this.renderHandle);
        clearInterval(this.otter_timer);
        this.resizeObserver?.disconnect();
    }

    render() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.pkg.w, this.pkg.h);

        this.renderEnv();
        this.renderClouds();
        this.renderVfx();
        if(this.musicPlayer.currentTime > this.duration){
            this.musicPlayer.pause();
            GameState.phase = GamePhase.ENDED;
        }

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
        const lowTime = cTime - cloudPresenceDuration * (1 - btnTrackPercent);
        const highTime = cTime + cloudPresenceDuration * btnTrackPercent;

        const timeRange = highTime - lowTime;

        const withinTimeRange = (t: number) => {
            return t <= highTime && t >= lowTime;
        }

        const calcXByProgress = (prog: number, additionalShift: number = 0) => {
            return this.xStd(cloudSpawnPercent + prog * (cloudDespawnPercent - cloudSpawnPercent)) + additionalShift;
        }

        this.ctx.lineWidth = 10;
        const vDisplace = 0.045;
        //hold cloud rendering
        this.heldKeyCheck();
        for (let h = 0; h < this.holdKeyTracker.length; h++) {
            let n = this.songData[this.holdKeyTracker[h]];

            const boundSize = interactionThreshold / 2;
            if (n.noteState == noteState.untouched && (n.timing + boundSize) < lowTime) {
                n.noteState = noteState.missed;
            }

            if ((n.timing + n.duration!) < lowTime) {
                this.holdKeyTracker.splice(h, 1);
                h--;
                continue;
            }

            let rPercent = n.timing < lowTime ? 1 : 1 - ((n.timing - lowTime) / timeRange);
            let rightLineAnchor = calcXByProgress(rPercent);

            let lPercent = n.timing + n.duration! > highTime ? 0 : 1 - ((n.timing + n.duration! - lowTime) / timeRange);
            let leftLineAnchor = calcXByProgress(lPercent);

            const lineOpacity = ['DD', 'FF', 'EE', '88'];
            this.ctx.strokeStyle = `#${btnColors[n.trackNo]}${lineOpacity[n.noteState]}`;
            this.ctx.beginPath()
            let lineY = this.yStd(trackYPositions[n.trackNo] + vDisplace);
            this.ctx.moveTo(leftLineAnchor, lineY);
            this.ctx.lineTo(rightLineAnchor, lineY);
            this.ctx.stroke();
        }

        this.ctx.lineWidth = 1;
        const cloudFadePercentage = 1 - btnTrackPercent;
        //single cloud rendering
        for (let i = 0; i < this.songData.length; i++) {
            if (!withinTimeRange(this.songData[i].timing)) {
                continue;
            }
            let v = this.songData[i];

            if (v.duration != undefined && v.noteState != noteState.missed && !this.holdKeyTracker.includes(i) && v.timing > lowTime) {
                this.holdKeyTracker.push(i);
                continue;
            }
            if (v.noteState == noteState.caught) {
                continue;
            }

            let prog = 1 - ((v.timing - lowTime) / timeRange); // left = 0%, right = 100%
            // this.ctx.strokeStyle = "orange";
            let progDist = calcXByProgress(prog, -(cloudSprites[v.trackNo].width / 2));
            // this.ctx.strokeRect(
            //     progDist,
            //     trackYPositions[v.trackNo] * this.canvas.height,
            //     cloudSprites[v.trackNo].width,
            //     cloudSprites[v.trackNo].height,
            // )

            this.ctx.globalAlpha = 1;
            if(prog < cloudFadePercentage || prog > (1 - cloudFadePercentage)){
                this.ctx.globalAlpha = (prog < cloudFadePercentage) ? (prog / cloudFadePercentage) : ((1 - prog) / cloudFadePercentage);
            }
            this.ctx.drawImage(
                cloudSprites[v.trackNo],
                progDist,
                trackYPositions[v.trackNo] * this.canvas.height
            )
            this.ctx.globalAlpha = 1;
        }
    }

    heldKeyCheck() {
        let hitVfx = new Image();
        hitVfx.src = getSrc("hit");
        this.heldKeys.forEach((k, i) => {
            if (k == this.empty) {
                return;
            }
            let n = this.songData[k];
            let bound = this.getBounds(interactionThreshold);
            if (bound.min > (n.timing + n.duration!)) {
                n.noteState = noteState.missed;
                this.heldKeys[i] = this.empty;
                this.addBtnVfx(i, false);
                this.setOtter(3);
            } else {
                this.ctx.drawImage(
                    hitVfx,
                    this.xStd(trackLength - .025),
                    this.yStd(trackYPositions[i] + .0125)
                )
                this.setOtter(2, 120);
            }
        });
    }

    renderVfx() {
        this.vfxObjs.forEach(obj => {
            obj.update();
        });
        this.vfxObjs = this.vfxObjs.filter(v => {
            return (this.musicPlayer.currentTime - v.startTime) < vfxDuration
        })
    }

    /**
     * returns the low and high bound of the current musicplayer time
     * @param size 
     * @returns 
     */
    getBounds(size: number) {
        return {
            min: this.musicPlayer.currentTime - (size / 2),
            max: this.musicPlayer.currentTime + (size / 2)
        }
    }

    xStd(x: number) {
        return x * this.canvas.width;
    }

    yStd(y: number) {
        return y * this.canvas.height;
    }

    addBtnVfx(track: number, hit: boolean) {
        let vfx = new cImg(this.pkg, trackLength - .025, trackYPositions[track] + .0125, [hit ? "hit" : "miss"])
        vfx.startTime = this.musicPlayer.currentTime;
        this.vfxObjs.push(vfx);
    }

    setOtter(index: number, ms = 1000) {
        if (this.otter_index < 0) return;
        const cur = this.staticObjs[this.otter_index] as cImg;
        cur.currentSprite = index;
        clearTimeout(this.otter_timer);
        this.otter_timer = window.setTimeout(() => {
            const def = this.staticObjs[this.otter_index] as cImg;
            if (def) def.currentSprite = 0;
        }, ms);

    }
}