import { Vector } from './vector';
import { CanvasKit } from './canvas_kit';
import { game } from './game';

class Minimap {
    #minimapDim = new Vector(1, 1);
    #minimapPos = new Vector(0, 0);

    #viewportDim = new Vector(1, 1);
    #viewportPos = new Vector(0, 0);

    /**
     * @description The position of the arrow normalized to the range [0,1]
     */
    #arrowPos = new Vector(0.5, 0.5);

    #drawViewport = false;

    constructor() {
        game.once('ready', () => {
            window.input.set_convar('ren_minimap_viewport', 'true');
            window.input.set_convar = new Proxy(window.input.set_convar, {
                apply: (target, thisArg, args) => {
                    if (args[0] === 'ren_minimap_viewport') this.#drawViewport = args[1];
                    else Reflect.apply(target, thisArg, args);
                },
            });
        });

        this._minimapHook();
        this._viewportHook();
        this._arrowHook();
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

    drawViewport(value: boolean): void {
        this.#drawViewport = value;
    }

    _minimapHook() {
        CanvasKit.hook('strokeRect', (target, thisArg, args) => {
            const transform = thisArg.getTransform();

            this.#minimapDim = new Vector(transform.a, transform.d);
            this.#minimapPos = new Vector(transform.e, transform.f);
        });
    }

    _viewportHook() {
        CanvasKit.replace('fillRect', (target, thisArg, args) => {
            const transform = thisArg.getTransform();

            if (
                Math.round((transform.a / transform.d) * 10_000) !==
                Math.round((window.innerWidth / window.innerHeight) * 10_000)
            ) {
                return Reflect.apply(target, thisArg, args);
            }
            if (transform.a >= window.innerWidth && transform.d >= window.innerHeight) {
                return Reflect.apply(target, thisArg, args);
            }

            this.#viewportDim = new Vector(transform.a, transform.d);
            this.#viewportPos = new Vector(transform.e, transform.f);

            if (this.#drawViewport) return Reflect.apply(target, thisArg, args);
        });
    }

    _arrowHook() {
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

        CanvasKit.hook('beginPath', (target, thisArg, args) => {
            index = 1;
        });
        CanvasKit.hook('moveTo', (target, thisArg, args) => {
            if (index === 1) {
                index++;
                pointA = new Vector(args[0], args[1]);
                return;
            }
            index = 0;
        });
        CanvasKit.hook('lineTo', (target, thisArg, args) => {
            if (index === 2) {
                index++;
                pointB = new Vector(args[0], args[1]);
                return;
            }
            if (index === 3) {
                index++;
                pointC = new Vector(args[0], args[1]);
                return;
            }
            index = 0;
        });
        CanvasKit.hook('fill', (target, thisArg, args) => {
            if (index === 4) {
                index++;
                calculatePos();
                return;
            }
            index = 0;
        });
    }
}

export const minimap = new Minimap();
