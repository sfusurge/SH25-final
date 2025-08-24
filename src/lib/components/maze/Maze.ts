
// boolean flag indicating which side of the tile contains walls, || the flags together to store.
export const CELL_TYPE = Object.freeze({
    LEFT: 0b1,
    UP: 0b10,
    RIGHT: 0b100,
    DOWN: 0b1000,

    LEFT_DOOR: 0b10000,
    UP_DOOR: 0b100000,
    RIGHT_DOOR: 0b1000000,
    DOWN_DOOR: 0b10000000,

    EMPTY: 0,
    UNUSED: 0b1111
});


export class Maze {
    map: Int32Array;
    width: number;
    height: number;

    constructor(width: number, height: number, map?: number[][]) {
        this.width = width;
        this.height = height;
        this.map = new Int32Array(this.width * this.height);

        if (map) {

            // simplify map, remove one of the walls if a two neighboring cells shares a wall.
            for (let row = 0; row < this.height; row++) {
                for (let col = 0; col < this.width; col++) {
                    let cell = map[row][col];

                    if (cell === CELL_TYPE.UNUSED) {
                        continue;
                    }

                    if (row < this.height - 1 && !(map[row + 1][col] === CELL_TYPE.UNUSED)) {
                        if (cell & CELL_TYPE.DOWN && map[row + 1][col] & CELL_TYPE.UP) {
                            cell = cell & (~CELL_TYPE.DOWN);
                        }

                        if (cell & CELL_TYPE.DOWN_DOOR && map[row + 1][col] & CELL_TYPE.UP_DOOR) {
                            cell = cell & (~CELL_TYPE.DOWN_DOOR);
                        }
                    }

                    if (col < this.width - 1 && !(map[row][col + 1] === CELL_TYPE.UNUSED)) {
                        if (cell & CELL_TYPE.RIGHT && map[row][col + 1] & CELL_TYPE.LEFT) {
                            cell = cell & (~CELL_TYPE.RIGHT);
                        }

                        if (cell & CELL_TYPE.RIGHT_DOOR && map[row][col + 1] & CELL_TYPE.LEFT_DOOR) {
                            cell = cell & (~CELL_TYPE.RIGHT_DOOR);
                        }
                    }

                    map[row][col] = cell;
                }
            }
            // flatten 2d array
            for (let row = 0; row < this.height; row++) {
                for (let col = 0; col < this.width; col++) {
                    this.map[row * this.width + col] = map[row][col];
                }
            }
        }
    }
}