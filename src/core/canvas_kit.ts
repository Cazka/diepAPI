import { Vector } from './vector';

type FunctionKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type RenderingContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

const CANVAS_KIT_BYPASS = Symbol('CanvasKit-bypass');

export class CanvasKit {
  /**
   * If you need a canvas then create it with this method.
   */
  static createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    (canvas as any)[CANVAS_KIT_BYPASS] = true;
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
  static hookCtx<T extends FunctionKeys<RenderingContext>>(
    method: T,
    consumer: (
      target: RenderingContext[T],
      thisArg: RenderingContext,
      args: Parameters<RenderingContext[T]>,
    ) => void,
    useOffscreenCtx = false,
  ): void {
    const target = useOffscreenCtx
      ? _window.OffscreenCanvasRenderingContext2D.prototype
      : _window.CanvasRenderingContext2D.prototype;

    target[method] = new Proxy(target[method], {
      apply(target, thisArg: RenderingContext, args: Parameters<RenderingContext[T]>) {
        if (!(thisArg.canvas as any)[CANVAS_KIT_BYPASS]) consumer(target, thisArg, args);
        return Reflect.apply(target, thisArg, args);
      },
    });
  }

  /**
   * replaces the function. Use `return Reflect.apply(target, thisArg, args);` in
   * your function to call the original function.
   */
  static overrideCtx<T extends FunctionKeys<RenderingContext>>(
    method: T,
    func: (
      target: RenderingContext[T],
      thisArg: RenderingContext,
      args: Parameters<RenderingContext[T]>,
    ) => unknown,
    useOffscreenCtx = false,
  ): void {
    const target = useOffscreenCtx
      ? _window.OffscreenCanvasRenderingContext2D.prototype
      : _window.CanvasRenderingContext2D.prototype;

    target[method] = new Proxy(target[method], {
      apply(target, thisArg: RenderingContext, args: Parameters<RenderingContext[T]>) {
        if (!(thisArg.canvas as any)[CANVAS_KIT_BYPASS]) return func(target, thisArg, args);
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
    cb: (vertices: Vector[], ctx: RenderingContext) => void,
    useOffscreenCtx = false,
  ): void {
    let index = 0;

    let vertices: Vector[] = [];

    const onFillPolygon = (ctx: RenderingContext) => cb(vertices, ctx);

    CanvasKit.hookCtx(
      'beginPath',
      (target, thisArg, args) => {
        index = 1;
        vertices = [];
      },
      useOffscreenCtx,
    );
    CanvasKit.hookCtx(
      'moveTo',
      (target, thisArg, args) => {
        if (index === 1) {
          index++;
          vertices.push(new Vector(args[0], args[1]));
          return;
        }
        index = 0;
      },
      useOffscreenCtx,
    );
    CanvasKit.hookCtx(
      'lineTo',
      (target, thisArg, args) => {
        if (index >= 2 && index <= numVertices) {
          index++;
          vertices.push(new Vector(args[0], args[1]));
          return;
        }
        index = 0;
      },
      useOffscreenCtx,
    );
    CanvasKit.hookCtx(
      'fill',
      (target, thisArg, args) => {
        if (index === numVertices + 1) {
          index++;
          onFillPolygon(thisArg);
          return;
        }
        index = 0;
      },
      useOffscreenCtx,
    );
  }
}
