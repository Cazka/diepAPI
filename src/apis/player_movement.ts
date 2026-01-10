import { Movement } from '../core/movement';
import { camera } from './camera';
import { game } from './game';

class PlayerMovement extends Movement {
  /**
   * Using the minimap arrow to get the player position and velocity
   */
  constructor() {
    super();

    game.on('frame_end', () => {
      super.updatePos(camera.position);
    });
  }
}

export const playerMovement = new PlayerMovement();
