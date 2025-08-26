import { CELL_TYPE } from "$lib/components/maze/Maze";
import type { Cell } from "$lib/components/maze/MazeGenerator";
import type { Room } from "$lib/components/maze/Room";

// Simple union find (no recursion needed probably)
class UnionFind {
    private parent: Map<number, number> = new Map();

    find(x: number): number {
        if (!this.parent.has(x)) {
            this.parent.set(x, x);
        }
        let root = x;
        while (this.parent.get(root) !== root) {
            root = this.parent.get(root)!;
        }
        return root;
    }

    union(x: number, y: number): void {
        const rootX = this.find(x);
        const rootY = this.find(y);
        if (rootX !== rootY) {
            this.parent.set(rootX, rootY);
        }
    }

    connected(x: number, y: number): boolean {
        return this.find(x) === this.find(y);
    }
}

export class PathGenerator {
    private width: number;
    private height: number;
    private regionIDCounter: number = 1;
    private unionFind: UnionFind = new UnionFind();

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    /** Generates maze paths, marking every tile as visited
     * borrowing from the growing tree alg in the website
     * @param map
     * @param windingPercent 0 is straight corridors, 100 is max branching
     */
    generateMazePaths(map: Cell[][], windingPercent: number, regionIDCounter: number): void {
        this.regionIDCounter = regionIDCounter;
        // Loop until all cells are visited
        let startCell = this.findFirstUnvisitedCell(map, { x: 0, y: 0 });
        while (startCell) {
            this.regionIDCounter++;
            this.generateMazeFromCell(startCell.x, startCell.y, map, windingPercent);
            startCell = this.findFirstUnvisitedCell(map, startCell);
        }
    }

    private generateMazeFromCell(startX: number, startY: number, map: Cell[][], windingPercent: number): void {
        const activeCells = [{ x: startX, y: startY }];
        let lastDirection = null;

        map[startX][startY].regionID = this.regionIDCounter;

        while (activeCells.length > 0) {
            const current = activeCells[activeCells.length - 1]; // Get most recent cell
            const neighbours = this.getUnvisitedNeighbours(current.x, current.y, map);

            if (neighbours.length > 0) {
                let chosenNeighbour: { x: number; y: number };

                // calculate direction from current to each neighbour
                const neighbourDirections = neighbours.map(neighbour => ({
                    neighbour,
                    direction: {
                        dx: neighbour.x - current.x,
                        dy: neighbour.y - current.y
                    }
                }));

                // use winding bias to calculate preferred direction
                let chosenDir = null;
                if (lastDirection && Math.random() * 100 > windingPercent) {
                    // go straight line 
                    chosenDir = neighbourDirections.find(nd =>
                        nd.direction.dx === lastDirection!.dx &&
                        nd.direction.dy === lastDirection!.dy
                    );
                }
                if (!chosenDir) {
                    const randomIndex = Math.floor(Math.random() * neighbourDirections.length);
                    chosenDir = neighbourDirections[randomIndex];
                }
                chosenNeighbour = chosenDir.neighbour;
                lastDirection = chosenDir.direction;

                // Remove wall in between
                this.removeWallBetween(current.x, current.y, chosenNeighbour.x, chosenNeighbour.y, map);

                // Mark neighbour as visited; add to active cells
                map[chosenNeighbour.x][chosenNeighbour.y].regionID = this.regionIDCounter;
                activeCells.push(chosenNeighbour);
            } else {
                // No unvisited neighbours, backtrack
                activeCells.pop();
                lastDirection = null; // Reset direction when backtracking
            }
        }
    }


    // TODO: is there a better way for this?
    private getUnvisitedNeighbours(x: number, y: number, map: Cell[][]): Array<{ x: number; y: number }> {
        const neighbours = [];

        // regionID of 0 means unvisited

        // Up
        if (this.isValidCell(x, y - 1) && !map[x][y - 1].regionID) {
            neighbours.push({ x: x, y: y - 1 });
        }
        // Right
        if (this.isValidCell(x + 1, y) && !map[x + 1][y].regionID) {
            neighbours.push({ x: x + 1, y: y });
        }
        // Down
        if (this.isValidCell(x, y + 1) && !map[x][y + 1].regionID) {
            neighbours.push({ x: x, y: y + 1 });
        }
        // Left
        if (this.isValidCell(x - 1, y) && !map[x - 1][y].regionID) {
            neighbours.push({ x: x - 1, y: y });
        }

        return neighbours;
    }


    // startCell is used as a param to optimize search (instead of starting from (0,0) -> N^2 to N)
    private findFirstUnvisitedCell(
        map: Cell[][],
        startCell: { x: number; y: number }
    ): { x: number; y: number } | null {

        for (let y = startCell.y; y < this.height; y++) {
            // For first row, start from startCell.x; for subsequent rows, start from 0
            let xStart = (y === startCell.y) ? startCell.x : 0;
            for (let x = xStart; x < this.width; x++) {
                if (!map[x][y].regionID) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    private isValidCell(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    private removeWallBetween(x1: number, y1: number, x2: number, y2: number, map: Cell[][]): void {

        if (x2 > x1) {
            // Moving right
            map[x1][y1].walls &= ~CELL_TYPE.RIGHT;
            map[x2][y2].walls &= ~CELL_TYPE.LEFT;
        } else if (x2 < x1) {
            // Moving left
            map[x1][y1].walls &= ~CELL_TYPE.LEFT;
            map[x2][y2].walls &= ~CELL_TYPE.RIGHT;
        } else if (y2 > y1) {
            // Moving down
            map[x1][y1].walls &= ~CELL_TYPE.DOWN;
            map[x2][y2].walls &= ~CELL_TYPE.UP;
        } else if (y2 < y1) {
            // Moving up
            map[x1][y1].walls &= ~CELL_TYPE.UP;
            map[x2][y2].walls &= ~CELL_TYPE.DOWN;
        }
    }


    /**
     * Connects all rooms and paths, creating spanning tree (perfect maze)
     * @param map 
     * @param rooms 
     */

    connectRegions(map: Cell[][], rooms: Room[], randomOpenPercent: number): void {

        const directions = {
            up: { dx: 0, dy: -1, wall: CELL_TYPE.UP, oppositeWall: CELL_TYPE.DOWN },
            right: { dx: 1, dy: 0, wall: CELL_TYPE.RIGHT, oppositeWall: CELL_TYPE.LEFT },
            down: { dx: 0, dy: 1, wall: CELL_TYPE.DOWN, oppositeWall: CELL_TYPE.UP },
            left: { dx: -1, dy: 0, wall: CELL_TYPE.LEFT, oppositeWall: CELL_TYPE.RIGHT }
        };

        // Collect all edge positions and directions for all rooms
        const allRoomEdges: Array<{ x: number; y: number; dir: keyof typeof directions }> = [];

        for (const room of rooms) {
            // Top edge
            for (let x = room.x1; x < room.x2; x++) {
                allRoomEdges.push({ x, y: room.y1, dir: "up" });
            }
            // Bottom edge
            for (let x = room.x1; x < room.x2; x++) {
                allRoomEdges.push({ x, y: room.y2 - 1, dir: "down" });
            }
            // Left edge
            for (let y = room.y1; y < room.y2; y++) {
                allRoomEdges.push({ x: room.x1, y, dir: "left" });
            }
            // Right edge
            for (let y = room.y1; y < room.y2; y++) {
                allRoomEdges.push({ x: room.x2 - 1, y, dir: "right" });
            }
        }

        // Shuffle allEdgeChecks array and perform checks in rand order
        for (let i = allRoomEdges.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allRoomEdges[i], allRoomEdges[j]] = [allRoomEdges[j], allRoomEdges[i]];
        }

        for (const check of allRoomEdges) {
            this.checkConnection(check.x, check.y, directions[check.dir], map, randomOpenPercent);
        }
    }

    private checkConnection = (x: number, y: number, direction: { dx: number, dy: number, wall: number, oppositeWall: number }, map: Cell[][], randomOpenPercent: number) => {
        const nx = x + direction.dx;
        const ny = y + direction.dy;

        const connect = (cell: Cell, neighbour: Cell) => {
            map[x][y].walls &= ~direction.wall;
            map[x][y].walls |= direction.wall << 4;

            map[nx][ny].walls &= ~direction.oppositeWall;
            map[nx][ny].walls |= direction.oppositeWall << 4;
            this.unionFind.union(cell.regionID, neighbour.regionID);
        };

        if (this.isValidCell(nx, ny)) {
            const cell = map[x][y];
            const neighbour = map[nx][ny];
            if (neighbour.regionID && neighbour.regionID !== cell.regionID) {

                // If regions are not connected, change wall to door and union them
                if (!this.unionFind.connected(cell.regionID, neighbour.regionID) || Math.random() < 0.02) {
                    connect(cell, neighbour);
                }
            }
        }
    };




    /**
     * Removes all dead ends from the maze by marking them as unused
     * @param map 
     */
    removeDeadEnds(map: Cell[][]): void {
        let hasDeadEnds = true;

        while (hasDeadEnds) {
            hasDeadEnds = false;

            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    const cell = map[x][y];


                    if (cell.walls === CELL_TYPE.UNUSED) {
                        continue;
                    }

                    // Dead end if three walls
                    const openPassages = this.countOpenPassages(x, y, map);
                    if (openPassages <= 1) {
                        this.markCellAsUnused(x, y, map);
                        hasDeadEnds = true;
                    }
                }
            }
        }
    }

    private countOpenPassages(x: number, y: number, map: Cell[][]): number {
        const cell = map[x][y];
        let openCount = 0;

        // = 4 - number of walls
        for (let i = 0; i < 4; i++) {
            if (((cell.walls >> i) & 1) === 0) {
                openCount++;
            }
        }
        return openCount;
    }


    private markCellAsUnused(x: number, y: number, map: Cell[][]): void {
        const cell = map[x][y];

        // Before marking as unused, close passages to neighbouring cells

        // Up
        if (!(cell.walls & CELL_TYPE.UP) && this.isValidCell(x, y - 1)) {
            const neighbour = map[x][y - 1];
            neighbour.walls |= CELL_TYPE.DOWN;
        }
        // Right
        if (!(cell.walls & CELL_TYPE.RIGHT) && this.isValidCell(x + 1, y)) {
            const neighbour = map[x + 1][y];
            neighbour.walls |= CELL_TYPE.LEFT;
        }
        // Down
        if (!(cell.walls & CELL_TYPE.DOWN) && this.isValidCell(x, y + 1)) {
            const neighbour = map[x][y + 1];
            neighbour.walls |= CELL_TYPE.UP;
        }
        // Left
        if (!(cell.walls & CELL_TYPE.LEFT) && this.isValidCell(x - 1, y)) {
            const neighbour = map[x - 1][y];
            neighbour.walls |= CELL_TYPE.RIGHT;
        }

        map[x][y].walls = CELL_TYPE.UNUSED;
    }
}
