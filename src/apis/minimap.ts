import { CanvasKit } from '../core/canvas_kit';
import { Vector } from '../core/vector';

import { game } from './game';

/**
 * The Minimap API
 */
class Minimap {
  #minimapDim = new Vector(1, 1);
  #minimapPos = new Vector(0, 0);

  #viewportDim = new Vector(1, 1);
  #viewportPos = new Vector(1, 1);

  #arrowPos = new Vector(0.5, 0.5);

  #drawViewport = false;

  constructor() {
    game.once('ready', () => {
      _window.input.set_convar('ren_minimap_viewport', 'true');
      _window.input.set_convar = new Proxy(_window.input.set_convar, {
        apply: (target, thisArg, args) => {
          if (args[0] === 'ren_minimap_viewport') {
            this.#drawViewport = args[1];
            return;
          }

          return Reflect.apply(target, thisArg, args);
        },
      });
    });

    this.#minimapHook();
    this.#viewportHook();
    this.#arrowHook();
  }

  get minimapDim(): Vector {
    return this.#minimapDim;
  }

  get minimapPos(): Vector {
    return this.#minimapPos;
  }

  get viewportDim(): Vector {
    return this.#viewportDim;
  }

  get viewportPos(): Vector {
    return this.#viewportPos;
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

  #viewportHook() {
    CanvasKit.overrideCtx('fillRect', (target, thisArg, args) => {
      const transform = thisArg.getTransform();

      if (thisArg.globalAlpha !== 0.1) {
        return Reflect.apply(target, thisArg, args);
      }
      if (
        Math.abs(transform.a / transform.d - _window.innerWidth / _window.innerHeight) >
        (_window.innerWidth / _window.innerHeight) * 0.000_05
      ) {
        return Reflect.apply(target, thisArg, args);
      }

      this.#viewportDim = new Vector(transform.a, transform.d);
      this.#viewportPos = new Vector(transform.e, transform.f);

      if (this.#drawViewport) {
        return Reflect.apply(target, thisArg, args);
      }
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
