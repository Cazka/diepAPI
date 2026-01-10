import { Vector } from '../core/vector';
import { config, memoryAccess } from '../wasm';
import { decodeFloat } from '../wasm/codec';

class Camera {
  get position(): Vector {
    if (!memoryAccess.HEAPU32) {
      return new Vector(0, 0);
    }

    const cameraX = Math.round(decodeFloat(memoryAccess.HEAPU32[config.CameraPositionX_ADDR >> 2]));
    const cameraY = Math.round(decodeFloat(memoryAccess.HEAPU32[config.CameraPositionY_ADDR >> 2]));

    return new Vector(cameraX, cameraY);
  }
}

export const camera = new Camera();
