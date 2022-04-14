import { Vector } from './vector';

const _window = typeof unsafeWindow == 'undefined' ? window : unsafeWindow;

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
        // TODO: game.once('ready')
        setTimeout(() => {
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
        }, 1000);

        this.#minimapHook();
        this.#viewPortHook();
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
        _window.CanvasRenderingContext2D.prototype.strokeRect = new Proxy(_window.CanvasRenderingContext2D.prototype.strokeRect, {
            apply(target, thisArg, args) {
                if (thisArg.canvas.className !== 'CanvasKit-bypass') {
                    const transform = thisArg.getTransform();

                    this.#minimapDim = new Vector(transform.a, transform.d);
                    this.#minimapPos = new Vector(transform.e, transform.f);
                }
                return Reflect.apply(target, thisArg, args);
            },
        });
    }

    #viewPortHook() {
        _window.CanvasRenderingContext2D.prototype.fillRect = new Proxy(_window.CanvasRenderingContext2D.prototype.fillRect, {
            apply(target, thisArg, args) {
                if (thisArg.canvas.className !== 'CanvasKit-bypass') {
                    const transform = thisArg.getTransform();

                    if (Math.round((transform.a / transform.d) * 10_000) !== Math.round((_window.innerWidth / _window.innerHeight) * 10_000)) {
                        return Reflect.apply(target, thisArg, args);
                    }
                    if (transform.a >= _window.innerWidth && transform.d >= _window.innerHeight) {
                        return Reflect.apply(target, thisArg, args);
                    }

                    this.#viewportDim = new Vector(transform.a, transform.d);
                    this.#viewportPos = new Vector(transform.e, transform.f);

                    if (this.#drawViewport) return Reflect.apply(target, thisArg, args);
                    return;
                }
                return Reflect.apply(target, thisArg, args);
            },
        });
    }

    #arrowHook() {
        let index = 0;

        let pointA: Vector;
        let pointB: Vector;
        let pointC: Vector;

        const calculatePos = () => {
            const side1 = Math.round(Vector.distance(pointA, pointB));
            const side2 = Math.round(Vector.distance(pointA, pointC));
            const side3 = Math.round(Vector.distance(pointB, pointC));
            if (side1 === side2 && side2 === side3) return;

            const centroid = Vector.centroid(pointA, pointB, pointC);
            const arrowPos = Vector.subtract(centroid, this.#minimapPos);
            const position = Vector.divide(arrowPos, this.#minimapDim);

            this.#arrowPos = position;
        };

        _window.CanvasRenderingContext2D.prototype.beginPath = new Proxy(_window.CanvasRenderingContext2D.prototype.beginPath, {
            apply(target, thisArg, args) {
                if (thisArg.canvas.className !== 'CanvasKit-bypass') {
                    index = 1;
                }
                return Reflect.apply(target, thisArg, args);
            },
        });

        _window.CanvasRenderingContext2D.prototype.moveTo = new Proxy(_window.CanvasRenderingContext2D.prototype.moveTo, {
            apply(target, thisArg, args) {
                if (thisArg.canvas.className !== 'CanvasKit-bypass') {
                    if (index === 1) {
                        index++;
                        pointA = new Vector(args[0], args[1]);
                        return Reflect.apply(target, thisArg, args);
                    }
                    index = 0;
                }
                return Reflect.apply(target, thisArg, args);
            },
        });

        _window.CanvasRenderingContext2D.prototype.lineTo = new Proxy(_window.CanvasRenderingContext2D.prototype.lineTo, {
            apply(target, thisArg, args) {
                if (thisArg.canvas.className !== 'CanvasKit-bypass') {
                    if (index === 2) {
                        index++;
                        pointB = new Vector(args[0], args[1]);
                        return Reflect.apply(target, thisArg, args);
                    }
                    if (index === 3) {
                        index++;
                        pointC = new Vector(args[0], args[1]);
                        return Reflect.apply(target, thisArg, args);
                    }
                    index = 0;
                }
                return Reflect.apply(target, thisArg, args);
            },
        });

        _window.CanvasRenderingContext2D.prototype.fill = new Proxy(_window.CanvasRenderingContext2D.prototype.fill, {
            apply(target, thisArg, args) {
                if (thisArg.canvas.className !== 'CanvasKit-bypass') {
                    if (index === 4) {
                        index++;
                        calculatePos();
                        return Reflect.apply(target, thisArg, args);
                    }
                    index = 0;
                }
                return Reflect.apply(target, thisArg, args);
            },
        });
    }
}

export const minimap = new Minimap();
