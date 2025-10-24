import { Vector } from '../core/vector';
import { arena } from './arena';
import { game } from './game';
import { minimap } from './minimap';

class Camera {
  #position: Vector = new Vector(0, 0);

  constructor() {
    game.on('frame_end', () => {
      const center = Vector.add(minimap.viewportPos, Vector.unscale(2, minimap.viewportDim));
      const cameraPos = Vector.subtract(center, minimap.minimapPos);
      const normalized = Vector.divide(cameraPos, minimap.minimapDim);
      this.#position = arena.scale(normalized);
    });
  }

  get position(): Vector {
    return this.#position;
  }
}

export const camera = new Camera();
