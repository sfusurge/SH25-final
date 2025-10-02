import { DoorEntity } from "./DoorEntity";
import { BlockerEntity } from "./BlockerEntity";
import { TrapEntity } from "./TrapEntity";
import { EnemyEntity } from "./Enemy/EnemyEntity";
import { ScrollEntity } from "./ScrollEntity";
import { Player } from "./Player";
import { ProjectileEntity } from "./ProjectileEntity";
import { WalkerEntity } from "$lib/components/maze/entities/Enemy/WalkerEntity";
import { BruiserEntity } from "./Enemy/BruiserEntity";

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
    EnemyEntity,
    ScrollEntity,
    Player,
    ProjectileEntity,
    WalkerEntity,
    BruiserEntity
};
