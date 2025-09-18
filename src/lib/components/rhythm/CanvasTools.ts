export interface RenderPkg {
    ctx: CanvasRenderingContext2D;
    w: number;
    h: number;
}

export abstract class component {
    x: number;
    y: number;
    ctx: CanvasRenderingContext2D;

    pkg: RenderPkg;

    startTime: number = 0;

    SpecialSetup: () => void;

    constructor(pkg: RenderPkg, x: number, y: number, setup = () => { }) {
        this.x = x;
        this.y = y;
        this.ctx = pkg.ctx;
        this.pkg = pkg;
        this.SpecialSetup = setup;
    }

    abstract update(): void;

    xStd(x: number) {
        return x * this.pkg.w;
    }

    yStd(y: number) {
        return y * this.pkg.h;
    }
}

export class cQuad extends component {
    width: number;
    height: number;
    type: string;

    constructor(pkg: RenderPkg, x: number, y: number, width: number, height: number, type: string, setup = () => { }) {
        super(pkg, x, y, setup);
        this.width = width;
        this.height = height;
        this.type = type;
    }

    update() {
        this.SpecialSetup();
        if (this.type == "fill") {
            this.ctx.fillRect(this.xStd(this.x), this.yStd(this.y), this.xStd(this.width), this.yStd(this.height));
        } else {
            this.ctx.strokeRect(this.xStd(this.x), this.yStd(this.y), this.xStd(this.width), this.yStd(this.height));
        }
    }
}

export class cCricle extends component {
    radius: number

    constructor(pkg: RenderPkg, x: number, y: number, radius: number, setup = () => { }) {
        super(pkg, x, y, setup);
        this.radius = radius;
    }

    update() {
        this.SpecialSetup();
        this.ctx.beginPath();
        this.ctx.arc(this.xStd(this.x), this.yStd(this.y), this.yStd(this.radius), 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
    }
}

export class cImg extends component {
    currentSprite: number;
    spriteForms: HTMLImageElement[];

    constructor(pkg: RenderPkg, x: number, y: number, spriteLocations: string[], currentId: number = 0, setup = () => { }) {
        super(pkg, x, y, setup);
        this.currentSprite = currentId;
        this.spriteForms = spriteLocations.map(loc => {
            let s: HTMLImageElement = new Image();
            s.src = `/rhythm/${loc}.webp`;
            return s;
        })
    }

    update() {
        this.SpecialSetup();
        this.ctx.drawImage(this.spriteForms[this.currentSprite], this.xStd(this.x), this.yStd(this.y));
    }
}