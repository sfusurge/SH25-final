import { DoorEntity } from "./DoorEntity";
import { BlockerEntity } from "./BlockerEntity";
import { TrapEntity } from "./TrapEntity";
import { WalkerEntity } from "./WalkerEntity";
import { ScrollEntity } from "./ScrollEntity";
import { Player } from "./Player";
import { ProjectileEntity } from "./ProjectileEntity";

export const ENTITY_TYPE = Object.freeze({
    player: -1,
    empty: 0,
    rock: 1,
    trap: 2,
    scroll: 3,
    enemy: 4,
    projectile: 5,
    door: 6,
});

export const LEFT = 0;
export const UP = 1;
export const RIGHT = 2;
export const DOWN = 3;

export {
    DoorEntity,
    BlockerEntity,
    TrapEntity,
    WalkerEntity,
    ScrollEntity,
    Player,
    ProjectileEntity
};
