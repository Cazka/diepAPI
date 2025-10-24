import { Vector } from '../core/vector';

import { minimap } from './minimap';
import { scaling } from './scaling';

class Arena {
  #size = 1;

  constructor() {
    setInterval(() => {
      const ratio = Vector.divide(minimap.minimapDim, minimap.viewportDim);
      const arenaDim = Vector.multiply(
        ratio,
        scaling.screenToCanvas(new Vector(_window.innerWidth, _window.innerHeight)),
      );
      const arenaSize = scaling.toArenaUnits(arenaDim);
      this.#size = arenaSize.x;
    }, 16);
  }

  /**
   * @returns {number} The Arena size in arena units
   */
  get size(): number {
    return this.#size;
  }

  /**
   *
   * @param {Vector} vector The vector in [0, 1] coordinates
   * @returns {Vector} The scaled vector in [-Arena.size/2, Arena.size/2] coordinates
   */
  scale(vector: Vector): Vector {
    const scale = (value: number) => Math.round(this.#size * (value - 0.5));
    return new Vector(scale(vector.x), scale(vector.y));
  }
  /**
   *
   * @param {Vector} vector - The scaled vector in [-Arena.size/2, Arena.size/2] coordinates
   * @returns {Vector} The unscaled vector in [0, 1] coordinates
   */
  unscale(vector: Vector): Vector {
    const unscale = (value: number) => value / this.#size + 0.5;
    return new Vector(unscale(vector.x), unscale(vector.y));
  }
}

export const arena = new Arena();
