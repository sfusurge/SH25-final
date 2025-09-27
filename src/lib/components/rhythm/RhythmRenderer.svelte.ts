import { GameMusicPlayer } from "$lib/components/rhythm/GmaeMusicPlayer.svelte";
import { component as Component, cQuad, cCircle, cImg, type RenderPkg as RenderPkg, getSrc, cText } from "./CanvasTools";
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
const scoreBoundsPercentage: boundRange = { min: 0.4, max: 0.75 };

const mobileSz = {
    trackXs: [0.095, 0.38, 0.665], //track space: 0.72, between space: 0.045, board space: 0.9
    trackYPos: 0.3,
    trackWidth: 0.24,
    trackLength: 0.625,

    btnPos: 0.825,
    btnPad: 0.07,
    btnRadius: 280 / 2 / 3000 * 0.625,

    cloudSpawnPercent: 0.3,
    cloudDespawnPercent: 0.975,

}
const trackXPos = 0.125;
const trackYPositions = [0.625, 0.725, 0.825]
const trackWidth = 0.065;
const trackLength = 0.75;

const btnPos = 0.75;
const btnPad = 0.01;
const btnColors = ["FF9D9D", "DFFFBE", "F9E8A5"];
const btnLabels = ["A/J", "S/K", "D/L"];


const cloudSpawnPercent: number = 0.125;
const cloudDespawnPercent: number = 0.85;
const cloudVerticalDisplace = 0.045;
const cloudPresenceDuration = 3000;

const spriteNames = ["red clouds", "green clouds", "yellow clouds"]
const cloudSprites = spriteNames.map(sN => {
    let s: HTMLImageElement = new Image();
    s.src = getSrc(sN);
    return s;
})

const interactionThreshold = 350;
const vfxDuration = 200;

type OtterState = "idle" | "idle2" | "hit" | "miss";

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
    notesVfx: Component | null = null;


    otter_state = $state('idle')
    otter_index = -1;
    otter_timer = 0;
    otter_idle = 0;

    points = $state(0);
    lowScoreThreshold = 0;
    highScoreThreshold = 0;
    addPoints(bonusMulti: number = 1) {
        this.points += basePoints * bonusMulti;
    }

    currentTime = 0;
    delta = 0;

    dpr = 1;
    resizeObserver: ResizeObserver | undefined;

    musicPlayer: GameMusicPlayer = new GameMusicPlayer();
    duration: number = this.empty;

    // variables for fade control
    isFadingOut: boolean = false;

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

    setSong(notes: RhythmNote[], song: AudioBuffer) {
        this.musicPlayer.song = song;

        this.musicPlayer.offsetTime = 0;
        this.musicPlayer.lastPlayTime = 0;
        this.musicPlayer.currentTime = 0;

        this.songData = notes;
        this.songData.forEach(note => {
            note.noteState = noteState.untouched;
        });

        let lastNote = this.songData[this.songData.length - 1]
        this.duration = lastNote.timing + (lastNote.duration ?? 0) + 250;
        this.lowScoreThreshold = Math.max(scoreBoundsPercentage.min * this.songData.length) * basePoints;
        this.highScoreThreshold = Math.max(scoreBoundsPercentage.max * this.songData.length) * basePoints;

    }

    startSong() {
        this.musicPlayer.play();
    }

    reset() {
        this.holdKeyTracker = [];
        this.heldKeys = [this.empty, this.empty, this.empty];
        this.holdKeyTracker = [];
        this.vfxObjs = [];
        this.notesVfx = null;
        this.duration = this.empty;
        this.musicPlayer.pause();
        this.musicPlayer.song = undefined;
        this.songData = [];
        this.points = 0;
    }

    setupEvents() {
        this.canvas.addEventListener("keypress", (e) => {
            switch (e.key.toLowerCase()) {
                case "a":
                case "j":
                    this.keyDown(trackIds.top);
                    break;
                case "s":
                case "k":
                    this.keyDown(trackIds.middle);
                    break;
                case "d":
                case "l":
                    this.keyDown(trackIds.bottom);
                    break;
            }
        }, { capture: true });

        this.canvas.addEventListener("touchstart", (e) => {
            if(this.mobileView){
                //divide by 3, mobile weird
                if(e.touches[0].clientY > this.yStd(mobileSz.btnPos - mobileSz.btnRadius) / 3){

                    if(e.touches[0].clientX < this.xStd(mobileSz.trackXs[trackIds.top] + mobileSz.trackWidth) / 3){
                        this.keyDown(trackIds.top);
                    }else if(e.touches[0].clientX > this.xStd(mobileSz.trackXs[trackIds.bottom]) / 3){
                        this.keyDown(trackIds.bottom);
                    }else{
                        this.keyDown(trackIds.middle);
                    }
                }
            }
        }, { capture: true });

        this.canvas.addEventListener("keyup", (e) => {
            switch (e.key.toLowerCase()) {
                case "a":
                case "j":
                    this.keyUp(trackIds.top);
                    break;
                case "s":
                case "k":
                    this.keyUp(trackIds.middle);
                    break;
                case "d":
                case "l":
                    this.keyUp(trackIds.bottom);
                    break;
            }
        }, { capture: true });

        this.canvas.addEventListener("touchend", (e) => {

            if(this.mobileView){
                //divide by 3, mobile weird
                if(e.touches[0].clientY > this.yStd(mobileSz.btnPos - mobileSz.btnRadius) / 3){

                    if(e.touches[0].clientX < this.xStd(mobileSz.trackXs[trackIds.top] + mobileSz.trackWidth) / 3){
                        this.keyUp(trackIds.top);
                    }else if(e.touches[0].clientX > this.xStd(mobileSz.trackXs[trackIds.bottom]) / 3){
                        this.keyUp(trackIds.bottom);
                    }else{
                        this.keyUp(trackIds.middle);
                    }
                }
            }
        }, { capture: true })

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
            new cQuad(this.pkg,
                this.mobileView ? 0.05 : 0.1,
                this.mobileView ? 0.275 : 0.58,
                this.mobileView ? 0.9 : 0.8,
                this.mobileView ? 0.675 : 0.37,
                "fill",
                () => {
                    this.ctx.restore();
                    this.ctx.fillStyle = "black";
                    this.ctx.globalAlpha = 0.4;
                })
        );

        //tracks
        trackYPositions.forEach((yPos, i) => {
            this.staticObjs.push(
                new cQuad(this.pkg,
                    this.mobileView ? mobileSz.trackXs[i] : trackXPos,
                    this.mobileView ? mobileSz.trackYPos : yPos,
                    this.mobileView ? mobileSz.trackWidth : trackLength,
                    this.mobileView ? mobileSz.trackLength : trackWidth,
                    "fill",
                    () => {
                        this.ctx.fillStyle = "black";
                        this.ctx.globalAlpha = 0.4;
                    }),
                new cQuad(this.pkg,
                    this.mobileView ? mobileSz.trackXs[i] : trackXPos,
                    this.mobileView ? mobileSz.trackYPos : yPos,
                    this.mobileView ? mobileSz.trackWidth : trackLength,
                    this.mobileView ? mobileSz.trackLength : trackWidth,
                    "stroke",
                    () => {
                        this.ctx.strokeStyle = "white";
                        this.ctx.lineWidth = 2;
                        this.ctx.globalAlpha = 1;
                    }),
                //button indicators
                new cCircle(this.pkg,
                    this.mobileView ? mobileSz.trackXs[i] + mobileSz.trackWidth / 2 : btnPos,
                    this.mobileView ? mobileSz.btnPos : yPos + trackWidth / 2,
                    this.mobileView ? mobileSz.btnRadius : (trackWidth / 2 - btnPad),
                    () => {
                        this.ctx.lineWidth = 0.1;
                        this.ctx.fillStyle = "#" + btnColors[i];
                        this.ctx.globalAlpha = 1;
                    })
            )
        });

        //button labels
        if (!this.mobileView) {
            trackYPositions.forEach((yPos, i) => {
                this.staticObjs.push(new cText(this.pkg, btnPos, yPos + trackWidth / 2 + .002, btnLabels[i]))
            })
        }
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
        this.addNotesVfx(hit);
        this.setOtter(hit ? 2 : 3, 1000);
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

        this.setOtter(note.noteState === noteState.caught ? 2 : 3, 1000);
        this.addNotesVfx(note.noteState === noteState.caught);
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
        // update canvas size before rendering to avoid flicker
        if (this.canvas.width !== this.pkg.w || this.canvas.height !== this.pkg.h) {
            this.canvas.width = this.pkg.w;
            this.canvas.height = this.pkg.h;
        }

        this.renderEnv();
        this.renderClouds();
        this.renderVfx();
        this.renderNotesVfx();
        if (this.duration != this.empty && this.musicPlayer.currentTime > this.duration) {
            this.musicPlayer.pause();
            GameState.phase = GamePhase.ENDED;
            this.songData = [];
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
        const btnTrackPercent = this.mobileView ?
            ((mobileSz.btnPos - mobileSz.cloudSpawnPercent) / (mobileSz.cloudDespawnPercent - mobileSz.cloudSpawnPercent))
            : ((btnPos - cloudSpawnPercent) / (cloudDespawnPercent - cloudSpawnPercent));

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

        const calcYByProgress = (prog: number, additionalShift: number = 0) => {
            return this.yStd(mobileSz.cloudSpawnPercent + prog * (mobileSz.cloudDespawnPercent - mobileSz.cloudSpawnPercent)) + additionalShift;
        }

        this.ctx.lineWidth = 10;
        //hold cloud rendering
        this.heldKeyCheck();
        for (let h = 0; h < this.holdKeyTracker.length; h++) {
            let n = this.songData[this.holdKeyTracker[h]];

            if(!n){
                break;
            }
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
            let rightLineAnchor = this.mobileView ? calcYByProgress(rPercent) : calcXByProgress(rPercent);

            let lPercent = n.timing + n.duration! > highTime ? 0 : 1 - ((n.timing + n.duration! - lowTime) / timeRange);
            let leftLineAnchor = this.mobileView ? calcYByProgress(lPercent) : calcXByProgress(lPercent);

            const lineOpacity = ['DD', 'FF', 'EE', '88'];
            this.ctx.strokeStyle = `#${btnColors[n.trackNo]}${lineOpacity[n.noteState]}`;
            this.ctx.beginPath()
            if (this.mobileView) {
                let lineX = this.xStd(mobileSz.trackXs[n.trackNo] + mobileSz.trackWidth / 2);
                this.ctx.moveTo(lineX, leftLineAnchor);
                this.ctx.lineTo(lineX, rightLineAnchor);
            } else {
                let lineY = this.yStd(trackYPositions[n.trackNo] + cloudVerticalDisplace);
                this.ctx.moveTo(leftLineAnchor, lineY);
                this.ctx.lineTo(rightLineAnchor, lineY);
            }
            this.ctx.stroke();
        }

        this.ctx.lineWidth = 1;
        const cloudFadePercentage = 1 - btnTrackPercent;
        //single cloud rendering
        for (let i = 0; i < this.songData.length; i++) {
            if (this.songData[i].timing < lowTime) {
                continue;
            }
            if (this.songData[i].timing > highTime) {
                break;
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
            let progDist = this.mobileView ?
                calcYByProgress(prog, -(cloudSprites[v.trackNo].height / 2)) :
                calcXByProgress(prog, -(cloudSprites[v.trackNo].width / 2));

            this.ctx.globalAlpha = 1;
            if (prog < cloudFadePercentage || prog > (1 - cloudFadePercentage)) {
                this.ctx.globalAlpha = (prog < cloudFadePercentage) ? (prog / cloudFadePercentage) : ((1 - prog) / cloudFadePercentage);
            }
            this.ctx.drawImage(
                cloudSprites[v.trackNo],
                this.mobileView ? this.xStd(mobileSz.trackXs[v.trackNo] + mobileSz.trackWidth / 2)
                    - cloudSprites[v.trackNo].width / 2 : progDist,
                this.mobileView ? progDist :
                    this.yStd(trackYPositions[v.trackNo] + trackWidth / 2) - cloudSprites[v.trackNo].height / 2
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
                this.setOtter(3, 1000);
            } else {
                this.ctx.drawImage(
                    hitVfx,
                    this.xStd(this.mobileView ? mobileSz.trackXs[i] + mobileSz.trackWidth / 2 - .045 : (trackLength - .025)),
                    this.yStd(this.mobileView ? mobileSz.btnPos - .0125 : (trackYPositions[i] + .0125))
                )
                this.setOtter(2, 1000);
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


    renderNotesVfx() {
        if (this.notesVfx) {
            const elapsed = this.musicPlayer.currentTime - this.notesVfx.startTime;

            if (elapsed < 2000) {
                let opacity = 1;

                if (elapsed > 1000) {
                    const fadeProgress = (elapsed - 1000) / 1000;
                    opacity = Math.max(0, 1 - fadeProgress);
                }

                this.ctx.save();
                this.ctx.globalAlpha = opacity;
                this.notesVfx.update();
                this.ctx.restore();
            } else {
                this.notesVfx = null;
            }
        }
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

    addNotesVfx(hit: boolean) {
        const xPos = this.mobileView
            ? 0.5 - 0.05
            : btnPos - 0.05;
        const yPos = this.mobileView
            ? mobileSz.btnPos - 0.1
            : 0.58 - 0.13;


        this.notesVfx = new cImg(this.pkg, xPos, yPos, [hit ? "vfxNice" : "vfxBad"]);
        this.notesVfx.startTime = this.musicPlayer.currentTime;
        this.isFadingOut = false;
    }


    addBtnVfx(track: number, hit: boolean) {
        let vfx = new cImg(
            this.pkg,
            this.mobileView ? mobileSz.trackXs[track] + mobileSz.trackWidth / 2 - .045 : trackLength - .025,
            this.mobileView ? mobileSz.btnPos - .0125 : trackYPositions[track] + .0125,
            [hit ? "hit" : "miss"])
        vfx.startTime = this.musicPlayer.currentTime;
        this.vfxObjs.push(vfx);
    }

    setOtter(index: number, ms: number) {
        if (index === 2) {
            this.otter_state = "hit";
        } else if (index === 3) {
            this.otter_state = "miss";
        } else {
            this.otter_state = "idle";
        }

        // reset after 1 second
        clearTimeout(this.otter_timer);
        this.otter_timer = window.setTimeout(() => {
            this.otter_state = "idle";
        }, ms);
    }

    pauseGame() {
        this.musicPlayer.pause();
    }

    resumeGame() {
        setTimeout(() => {
            this.musicPlayer.play();
        }, 3000)
    }
}