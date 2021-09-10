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
                consumer(target, thisArg, args);
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
                return func(target, thisArg, args);
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
}
