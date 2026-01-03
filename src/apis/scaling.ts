import { Vector } from '../core/vector';
import { codec, config, memoryAccess } from '../wasm';
import { camera } from './camera';
class Scaling {
  #scalingFactor = 1;

  get windowRatio(): number {
    return Math.max(_window.innerWidth / 1920, _window.innerHeight / 1080);
  }

  get scalingFactor(): number {
    return this.fov * this.windowRatio;
  }

  get fov(): number {
    if (!memoryAccess.HEAPU32) {
      return 0;
    }
    const fov = memoryAccess.HEAPU32[config.FOV_PTR >> 2];
    return codec.decodeFloat(fov);
  }

  /**
   *
   * @param {Vector} v The vector in canvas units
   * @returns {Vector} The vector in arena units
   */
  toArenaUnits(v: Vector): Vector {
    return Vector.round(Vector.unscale(this.#scalingFactor, v));
  }

  /**
   *
   * @param {Vector} v The vector in arena units
   * @returns {Vector} The vector in canvas units
   */
  toCanvasUnits(v: Vector): Vector {
    return Vector.round(Vector.scale(this.#scalingFactor, v));
  }

  /**
   * Will translate coordinates from canvas to arena
   * @param {Vector} canvasPos The canvas coordinates
   * @returns {Vector} The `canvasPos` translated to arena coordinates
   */
  toArenaPos(canvasPos: Vector): Vector {
    const direction = Vector.subtract(
      canvasPos,
      this.screenToCanvas(new Vector(_window.innerWidth / 2, _window.innerHeight / 2)),
    );
    const scaled = this.toArenaUnits(direction);
    const arenaPos = Vector.add(scaled, camera.position);

    return arenaPos;
  }

  /**
   * Will translate coordinates from arena to canvas
   * @param {Vector} arenaPos The arena coordinates
   * @returns {Vector} The `arenaPos` translated to canvas coordinates
   */
  toCanvasPos(arenaPos: Vector): Vector {
    const direction = Vector.subtract(arenaPos, camera.position);
    const scaled = this.toCanvasUnits(direction);
    const canvasPos = Vector.add(
      scaled,
      this.screenToCanvas(new Vector(_window.innerWidth / 2, _window.innerHeight / 2)),
    );

    return canvasPos;
  }

  screenToCanvasUnits(n: number) {
    return n * _window.devicePixelRatio;
  }

  canvasToScreenUnits(n: number) {
    return n / _window.devicePixelRatio;
  }

  /**
   * Will translate coordinates from screen to canvas
   * @param v The screen coordinates
   * @returns The canvas coordinates
   */
  screenToCanvas(v: Vector) {
    return Vector.scale(_window.devicePixelRatio, v);
  }

  /**
   * Will translate coordinates from canvas to screen
   * @param v The canvas coordinates
   * @returns the screen coordinates
   */
  canvasToScreen(v: Vector) {
    return Vector.scale(1 / _window.devicePixelRatio, v);
  }
}

export const scaling = new Scaling();
