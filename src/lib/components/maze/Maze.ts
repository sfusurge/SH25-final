
// boolean flag indicating which side of the tile contains walls, || the flags together to store.
export const WALL_TYPE = Object.freeze({
    LEFT: 0b1,
    UP: 0b10,
    RIGHT: 0b100,
    DOWN: 0b1000
});



export class Maze {
    map: Int32Array;

    width: number;
    height: number;
    constructor(map: number[][]) {
        this.height = map.length;
        this.width = map[0].length;
        this.map = new Int32Array(this.width * this.height);

        // flatten 2d array
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                this.map[row * this.width + col] = map[row][col];
            }
        }
    }
}