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
}

/**
 * Represents an ingame Entity.
 *
 * Holds minimal information currently.
 */
export class Entity extends Movement {
    constructor(readonly type: EntityType) {
        super();
    }

    updatePos(newPos: Vector): void {
        super.updatePos(newPos);
    }
}
