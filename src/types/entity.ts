import { Movement } from '../core/movement';
import { Vector } from '../core/vector';

export enum EntityType {
  Player,
  Bullet,
  Drone,
  Trap,
  Square,
  Triangle,
  Pentagon,
  Hexagon,
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
  Hexagon = '#35c5db',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  AlphaPentagon = '#768dfc',
  Crasher = '#f177dd',
  NecromancerDrone = '#fcc376',
}

export const TeamColors = [
  EntityColor.TeamBlue,
  EntityColor.TeamRed,
  EntityColor.TeamPurple,
  EntityColor.TeamGreen,
];

/**
 * Represents an ingame Entity.
 *
 * Holds minimal information currently.
 */
export class Entity extends Movement {
  constructor(
    readonly type: EntityType,
    readonly parent: Entity | undefined,
    readonly extras: {
      id: string;
      timestamp: number;
      color?: string;
      radius?: number;
    },
  ) {
    super();
  }

  updatePos(newPos: Vector): void {
    super.updatePos(newPos);
  }
}
