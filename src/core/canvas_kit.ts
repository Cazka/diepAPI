import { Vector } from './vector';

type FunctionKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

export class CanvasKit {
  /**
   * If you need a canvas then create it with this method.
   */
  static createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.className = 'CanvasKit-bypass';
    canvas.style.pointerEvents = 'none';
    canvas.style.position = 'fixed';
    canvas.style.zIndex = '1';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.right = '0px';
    canvas.style.bottom = '0px';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    return canvas;
  }

  /**
   * The consumer will be called before.
   */
  static hookRAF(consumer: () => void): void {
    _window.requestAnimationFrame = new Proxy(_window.requestAnimationFrame, {
      apply(target, thisArg, args) {
        consumer();
        return Reflect.apply(target, thisArg, args);
      },
    });
  }

  /**
   * The consumer will be called before
   */
  static hookCtx<T extends FunctionKeys<CanvasRenderingContext2D>>(
    method: T,
    consumer: (
      target: CanvasRenderingContext2D[T],
      thisArg: CanvasRenderingContext2D,
      args: Parameters<CanvasRenderingContext2D[T]>,
    ) => void,
  ): void {
    const target = _window.CanvasRenderingContext2D.prototype;
    target[method] = new Proxy(target[method], {
      apply(
        target,
        thisArg: CanvasRenderingContext2D,
        args: Parameters<CanvasRenderingContext2D[T]>,
      ) {
        if (thisArg.canvas.className !== 'CanvasKit-bypass') consumer(target, thisArg, args);
        return Reflect.apply(target, thisArg, args);
      },
    });
  }

  /**
   * replaces the function. Use `return Reflect.apply(target, thisArg, args);` in
   * your function to call the original function.
   */
  static overrideCtx<T extends FunctionKeys<CanvasRenderingContext2D>>(
    method: T,
    func: (
      target: CanvasRenderingContext2D[T],
      thisArg: CanvasRenderingContext2D,
      args: Parameters<CanvasRenderingContext2D[T]>,
    ) => unknown,
  ): void {
    const target = _window.CanvasRenderingContext2D.prototype;
    target[method] = new Proxy(target[method], {
      apply(
        target,
        thisArg: CanvasRenderingContext2D,
        args: Parameters<CanvasRenderingContext2D[T]>,
      ) {
        if (thisArg.canvas.className !== 'CanvasKit-bypass') return func(target, thisArg, args);
        return Reflect.apply(target, thisArg, args);
      },
    });
  }

  /**
   *
   * Calls the callback method when a polygon with `numVertices` is being drawn.
   */
  static hookPolygon(
    numVertices: number,
    cb: (vertices: Vector[], ctx: CanvasRenderingContext2D) => void,
  ): void {
    let index = 0;

    let vertices: Vector[] = [];

    const onFillPolygon = (ctx: CanvasRenderingContext2D) => {
      cb(vertices, ctx);
    };

    CanvasKit.hookCtx('beginPath', (target, thisArg, args) => {
      index = 1;
      vertices = [];
    });
    CanvasKit.hookCtx('moveTo', (target, thisArg, args) => {
      if (index === 1) {
        index++;
        vertices.push(new Vector(args[0], args[1]));
        return;
      }
      index = 0;
    });
    CanvasKit.hookCtx('lineTo', (target, thisArg, args) => {
      if (index >= 2 && index <= numVertices) {
        index++;
        vertices.push(new Vector(args[0], args[1]));
        return;
      }
      index = 0;
    });
    CanvasKit.hookCtx('fill', (target, thisArg, args) => {
      if (index === numVertices + 1) {
        index++;
        onFillPolygon(thisArg);
        return;
      }
      index = 0;
    });
  }
}
