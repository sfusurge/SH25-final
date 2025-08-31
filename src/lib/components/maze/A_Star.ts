import type { Entity } from "$lib/components/maze/Entity";

interface Node {
    parent?: Node;
    x: number;
    y: number;

    g: number; // distance to starting point
    h: number;  // heuristics
    f: number; // total cost, f = g + h;
}
/**
 * source: https://medium.com/@nicholas.w.swift/easy-a-star-pathfinding-7e6689c7f7b2
 * @param room 
 * @param start 
 * @param end 
 */
export function AStar(room: (Entity | undefined)[][], startX: number, startY: number, endX: number, endY: number) {
    const start: Node = {
        x: startX,
        y: startY,
        g: 0, h: 0, f: 0,
    };
    const end: Node = {
        x: endX,
        y: endY,
        g: 0, h: 0, f: 0
    };

    const queue: Node[] = [start];
    const visited = new Set<number>();
    const queueSet = new Set<number>();

    while (queue.length > 0) {
        let cur = queue[0];
        let curIdx = 0;

        for (let i = 0; i < queue.length; i++) {
            const item = queue[i];
            if (item.f < cur.f) { // find node with lowest cost so far, choose any if tide.
                cur = item;
                curIdx = i;
            }
        }

        // current item is processed.
        queue.splice(curIdx, 1);
        queueSet.delete(cur.x * 1000 + cur.y)
        visited.add(cur.x * 1000 + cur.y); // "id" of the node

        // at dest
        if (cur.x === end.x && cur.y === end.y) {
            // TODO, consider if returning the entire path is needed. 
            // just return the next move for now.
            const out = [];
            while (cur.parent) {
                out.push({ x: cur.x, y: cur.y })
                cur = cur.parent;
            }

            return out;
        }

        // add nearby nodes to visit
        const children: Node[] = [];
        //  [-1, -1], [-1, 1], [1, -1], [1, 1]
        const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1], ]
        for (const [dx, dy] of dirs) {
            // x prime y prime xd
            const xp = cur.x + dx;
            const yp = cur.y + dy;

            if (xp < 0 || xp >= room[0].length || yp < 0 || yp >= room.length) {
                continue;
            }
            // console.log(room[yp][xp] !== undefined, room[yp][xp] !== undefined && room[yp][xp].solid);

            if (room[yp][xp] !== undefined && room[yp][xp].solid) {
                // undefined spot means empty, don't skip it.
                continue; // don't visit solid spots
            }

            children.push({
                x: xp, y: yp,
                f: 0, g: 0, h: 0,
                parent: cur
            });

        }


        // process each children
        for (const c of children) {
            if (visited.has(c.x * 1000 + c.y)) {
                continue;
            }

            c.g = cur.g + 1;
            c.h = (end.x - c.x) ** 2 + (end.y - c.y) ** 2; // use squared distance and heuristics.
            c.f = c.g + c.h;

            if (queueSet.has(c.x * 1000 + c.y)) {
                // TODO, this bit is not the same as original, will not find optional path.
                // continue;
                let skipChild = false
                for (const q of queue) {
                    if (q.x * 1000 + q.y === c.x * 1000 + q.y && c.g > q.g) {
                        skipChild = true;
                        break;
                    }
                }

                if (skipChild) {
                    continue;
                }
            }

            queue.push(c);
            queueSet.add(c.x * 1000 + c.y);
        }


    }

    return undefined; // none of reachable nodes are dest.
}