export class CanvasKit {
    /**
     * The consumer will be called before
     */
    static hook(
        method: string,
        consumer: (target: Function, thisArg: CanvasRenderingContext2D, args: any[]) => void
    ): void {
        const target = window.CanvasRenderingContext2D.prototype;
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
    static replace(
        method: string,
        func: (target: Function, thisArg: CanvasRenderingContext2D, args: any[]) => any
    ): void {
        const target = window.CanvasRenderingContext2D.prototype;
        target[method] = new Proxy(target[method], {
            apply(target, thisArg, args) {
                if (thisArg.canvas.className !== 'CanvasKit-bypass') return func(target, thisArg, args);
                return Reflect.apply(target, thisArg, args);
            },
        });
    }

    /**
     * The consumer will be called before.
     */
    static hookRAF(consumer: () => void): void {
        window.requestAnimationFrame = new Proxy(window.requestAnimationFrame, {
            apply(target, thisArg, args) {
                consumer();
                return Reflect.apply(target, thisArg, args);
            },
        });
    }

    /**
     * If you want to a canvas then create it with this method.
     */
    static createCanvas(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.className = 'CanvasKit-bypass';
        canvas.style.pointerEvents = 'none';
        canvas.style.position = 'fixed';
        canvas.style['z-index'] = 1;
        canvas.style.top = '0px';
        canvas.style.left = '0px';
        canvas.style.right = '0px';
        canvas.style.bottom = '0px';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        return canvas;
    }
}
