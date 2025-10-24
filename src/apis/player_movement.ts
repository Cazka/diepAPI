import { Movement } from '../core/movement';
import { arena } from './arena';
import { game } from './game';
import { minimap } from './minimap';

class PlayerMovement extends Movement {
  /**
   * Using the minimap arrow to get the player position and velocity
   */
  constructor() {
    super();

    game.on('frame_end', () => {
      super.updatePos(arena.scale(minimap.arrowPos));
    });
  }
}

export const playerMovement = new PlayerMovement();
