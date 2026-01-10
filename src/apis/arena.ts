import { Vector } from '../core/vector';
import { config, memoryAccess } from '../wasm';

class Arena {
  /**
   * @returns {Vector} The Arena size in arena units
   */
  get size(): Vector {
    if (!memoryAccess.HEAPF32) {
      return new Vector(1, 1);
    }

    const width = Math.round(memoryAccess.HEAPF32[config.ARENA_WIDTH_ADDR >> 2]);
    const height = Math.round(memoryAccess.HEAPF32[config.ARENA_HEIGHT_ADDR >> 2]);

    return new Vector(width, height);
  }

  /**
   *
   * @param {Vector} vector The vector in [0, 1] coordinates
   * @returns {Vector} The scaled vector in [-Arena.size/2, Arena.size/2] coordinates
   */
  scale(vector: Vector): Vector {
    const scaleX = (value: number) => Math.round(this.size.x * (value - 0.5));
    const scaleY = (value: number) => Math.round(this.size.y * (value - 0.5));
    return new Vector(scaleX(vector.x), scaleY(vector.y));
  }

  /**
   *
   * @param {Vector} vector - The scaled vector in [-Arena.size/2, Arena.size/2] coordinates
   * @returns {Vector} The unscaled vector in [0, 1] coordinates
   */
  unscale(vector: Vector): Vector {
    const unscaleX = (value: number) => value / this.size.x + 0.5;
    const unscaleY = (value: number) => value / this.size.y + 0.5;
    return new Vector(unscaleX(vector.x), unscaleY(vector.y));
  }
}

export const arena = new Arena();
