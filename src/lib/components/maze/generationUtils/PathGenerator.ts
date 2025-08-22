import { WALL_TYPE } from "$lib/components/maze/Maze";

type Cell = {
    walls: number;
    visited: boolean;
};

export class PathGenerator {
    private width: number;
    private height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    /** Generates maze paths, marking every tile as visited
     * borrowing from the growing tree alg in the website
     * @param map
     * @param windingPercent 0 is straight corridors, 100 is max branching
     */
    generateMazePaths(map: Cell[][], windingPercent: number): void {

        // Loop until all cells are visited
        let startCell = this.findFirstUnvisitedCell(map, { x: 0, y: 0 });
        while (startCell) {
            this.generateMazeFromCell(startCell.x, startCell.y, map, windingPercent);
            startCell = this.findFirstUnvisitedCell(map, startCell);
        }
    }

    private generateMazeFromCell(startX: number, startY: number, map: Cell[][], windingPercent: number): void {
        const activeCells = [{ x: startX, y: startY }];
        let lastDirection = null;

        map[startX][startY].visited = true;

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
                map[chosenNeighbour.x][chosenNeighbour.y].visited = true;
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

        // Up
        if (this.isValidCell(x, y - 1) && !map[x][y - 1].visited) {
            neighbours.push({ x: x, y: y - 1 });
        }
        // Right
        if (this.isValidCell(x + 1, y) && !map[x + 1][y].visited) {
            neighbours.push({ x: x + 1, y: y });
        }
        // Down
        if (this.isValidCell(x, y + 1) && !map[x][y + 1].visited) {
            neighbours.push({ x: x, y: y + 1 });
        }
        // Left
        if (this.isValidCell(x - 1, y) && !map[x - 1][y].visited) {
            neighbours.push({ x: x - 1, y: y });
        }

        return neighbours;
    }


    // startCell is param to optimize search (don't have to start from (0,0)) -> N^2 to N
    private findFirstUnvisitedCell(
        map: Cell[][],
        startCell: { x: number; y: number }
    ): { x: number; y: number } | null {

        for (let y = startCell.y; y < this.height; y++) {
            // For first row, start from startCell.x; for subsequent rows, start from 0
            let xStart = (y === startCell.y) ? startCell.x : 0;
            for (let x = xStart; x < this.width; x++) {
                if (!map[x][y].visited) {
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
            map[x1][y1].walls &= ~WALL_TYPE.RIGHT;
            map[x2][y2].walls &= ~WALL_TYPE.LEFT;
        } else if (x2 < x1) {
            // Moving left
            map[x1][y1].walls &= ~WALL_TYPE.LEFT;
            map[x2][y2].walls &= ~WALL_TYPE.RIGHT;
        } else if (y2 > y1) {
            // Moving down
            map[x1][y1].walls &= ~WALL_TYPE.DOWN;
            map[x2][y2].walls &= ~WALL_TYPE.UP;
        } else if (y2 < y1) {
            // Moving up
            map[x1][y1].walls &= ~WALL_TYPE.UP;
            map[x2][y2].walls &= ~WALL_TYPE.DOWN;
        }
    }
}
