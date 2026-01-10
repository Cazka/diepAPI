import { CanvasKit } from '../core/canvas_kit';
import { Vector } from '../core/vector';

/**
 * The Minimap API
 */
class Minimap {
  #minimapDim = new Vector(1, 1);
  #minimapPos = new Vector(0, 0);

  #arrowPos = new Vector(0.5, 0.5);

  constructor() {
    this.#minimapHook();
    this.#arrowHook();
  }

  get minimapDim(): Vector {
    return this.#minimapDim;
  }

  get minimapPos(): Vector {
    return this.#minimapPos;
  }

  get arrowPos(): Vector {
    return this.#arrowPos;
  }

  #minimapHook() {
    CanvasKit.hookCtx('strokeRect', (target, thisArg, args) => {
      const transform = thisArg.getTransform();

      this.#minimapDim = new Vector(transform.a, transform.d);
      this.#minimapPos = new Vector(transform.e, transform.f);
    });
  }

  #arrowHook() {
    CanvasKit.hookPolygon(3, (vertices, ctx) => {
      const side1 = Math.round(Vector.distance(vertices[0], vertices[1]));
      const side2 = Math.round(Vector.distance(vertices[0], vertices[2]));
      const side3 = Math.round(Vector.distance(vertices[1], vertices[2]));
      if (side1 === side2 && side2 === side3) return;

      const centroid = Vector.centroid(...vertices);
      const arrowPos = Vector.subtract(centroid, this.#minimapPos);
      const position = Vector.divide(arrowPos, this.#minimapDim);

      this.#arrowPos = position;
    });
  }
}

export const minimap = new Minimap();
