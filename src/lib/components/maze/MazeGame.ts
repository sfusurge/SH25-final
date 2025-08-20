
export class MazeGame {


    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;
        const ctx = canvas.getContext("2d", {});

        if(!ctx) {
            throw Error("unable to obtain rendering context");
        }
        this.ctx = ctx;
    }

}