import { component, cQuad, cCricle, cImg, type renderPkg } from "./CanvasTools";

const trackXPos = 0.125;
const trackYPos = [0.625, 0.725, 0.825]
const trackWidth = 0.065;
const trackLength = 0.75;

interface rhythmNote{
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
var beatsList:rhythmNote[] = beatMap.map(note => {
    let nInfo = note.split(", ")
    const n: rhythmNote = {
        trackNo: parseInt(nInfo[0]),
        timing: parseInt(nInfo[1]),
        duration: nInfo.length > 2 ? parseInt(nInfo[2]) : 0
    }
    return n;
})

export class RhythmRenderer{

    canvas: HTMLCanvasElement;
    cHeight: number = 0;
    cWidth: number = 0;
    ctx: CanvasRenderingContext2D;

    pkg: renderPkg;

    songData: rhythmNote[];

    staticObjs: component[] = [];
    cloudObjs: component[] = [];

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.pkg = {
            ctx: this.ctx, 
            w: canvas.width, 
            h: canvas.height
        }

        this.songData = beatsList; //default
        
        this.init();
    }

    renderHandle = -1
    init(){
        this.renderHandle = requestAnimationFrame(this.eventLoop.bind(this));
        this.setupEnv()
    }

    setSong(data: rhythmNote[]){
        this.songData = data;
    }

    setCanvasDimensions(w: number, h: number){
        // this.cHeight = h;
        // this.cWidth = w;
    }

    resetStats(){
        this.songData = beatsList;
    }

    setupEnv(){
        this.staticObjs.push(
            new cQuad(this.pkg, 0.1, 0.58, 0.8, 0.37, "fill", ()=>{
                this.ctx.fillStyle = "black";
                this.ctx.globalAlpha = 0.4;
            })
        );

        trackYPos.forEach(pos => {
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
    }

    lastTime = 0;
    delta = 0;
    eventLoop(currentTime: number){
        this.clearScreen();
        this.render();
        this.renderHandle = requestAnimationFrame(this.eventLoop.bind(this));
    }

    destroy() {
        cancelAnimationFrame(this.renderHandle);
    }

    render(){
        this.staticObjs.forEach(obj => {
            obj.update();
        });
        // console.log(this.staticObjs[0].update())
    }

    clearScreen(){
        this.ctx.clearRect(0, 0, this.cWidth, this.cHeight);
    }
}