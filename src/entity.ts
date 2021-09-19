import { Vector } from './vector';
import { Movement } from './movement';

export enum EntityType {
    Player,
    Bullet,
    Drone,
    Trap,
    Square,
    Triangle,
    Pentagon,
    AlphaPentagon,
    Crasher,
    UNKNOWN,
}

export enum EntityColor {
    TeamBlue = '#00b2e1',
    TeamRed = '#f14e54',
    TeamPurple = '#bf7ff5',
    TeamGreen = '#00e16e',
    Square = '#ffe869',
    Triangle = '#fc7677',
    Pentagon = '#768dfc',
    AlphaPentagon = '#768dfc',
    Crasher = '#f177dd',
    NecromancerDrone = '#fcc376',
}

export const TeamColors = [EntityColor.TeamBlue, EntityColor.TeamRed, EntityColor.TeamPurple, EntityColor.TeamGreen];

/**
 * Represents an ingame Entity.
 *
 * Holds minimal information currently.
 */
export class Entity extends Movement {
    constructor(readonly type: EntityType, readonly extras: object = {}) {
        super();
    }

    updatePos(newPos: Vector): void {
        super.updatePos(newPos);
    }
}
