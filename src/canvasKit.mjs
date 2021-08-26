export default class CanvasKit {
    /**
     * The consumer will be called before
     * @param {string} method
     * @param {Function} consumer The consumer with `(target, thisArg, args)` as arguments
     */
    static hook(method, consumer) {
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
     * @param {string} method
     * @param {Function} func The func with `(target, thisArg, args)` as arguments
     */
    static replace(method, func) {
        const target = window.CanvasRenderingContext2D.prototype;
        target[method] = new Proxy(target[method], {
            apply(target, thisArg, args) {
                func(target, thisArg, args);
            },
        });
    }

    /**
     * The consumer will be called before.
     * @param {Function} consumer The consumer with `(target, thisArg, args)` as arguments
     */
    static hookRAF(consumer) {
        window.requestAnimationFrame = new Proxy(window.requestAnimationFrame, {
            apply(target, thisArg, args) {
                consumer(target, thisArg, args);
                return Reflect.apply(target, thisArg, args);
            },
        });
    }
}
