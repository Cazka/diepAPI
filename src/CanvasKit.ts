import { Vector } from './vector';

const _window = typeof unsafeWindow == 'undefined' ? window : unsafeWindow;

export class CanvasKit {
    /**
     * The consumer will be called before
     */
    static hookCtx(
        method: string,
        consumer: (target: Function, thisArg: CanvasRenderingContext2D, args: any[]) => void
    ): void {
        const target = _window.CanvasRenderingContext2D.prototype;
        target[method] = new Proxy(target[method], {
            apply(target, thisArg, args) {
                if (thisArg.canvas.className !== 'CanvasKit-bypass') consumer(target, thisArg, args);
                return Reflect.apply(target, thisArg, args);
            },
        });
    }

    /**
     * replaces the function. Use `return Reflect.apply(target, thisArg, args);` in
     * your function to call the original function.
     */
    static replaceCtx(
        method: string,
        func: (target: Function, thisArg: CanvasRenderingContext2D, args: any[]) => any
    ): void {
        const target = _window.CanvasRenderingContext2D.prototype;
        target[method] = new Proxy(target[method], {
            apply(target, thisArg, args) {
                if (thisArg.canvas.className !== 'CanvasKit-bypass') return func(target, thisArg, args);
                return Reflect.apply(target, thisArg, args);
            },
        });
    }

    /**
     *
     * Calls the callback method when a polygon with `numVertices` is being drawn.
     */
    static hookPolygon(numVertices: number, cb: (vertices: Vector[], ctx: CanvasRenderingContext2D) => void): void {
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
