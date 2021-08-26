import Vector from './vector.mjs';
import CanvasKit from './canvasKit.mjs';

let instance = null;

export default class Minimap {
    constructor() {
        if (instance) return instance;
        instance = this;

        this._minimapDim = new Vector(1, 1);
        this._minimapPos = new Vector(0, 0);

        this._viewportDim = new Vector(1, 1);
        this._viewPortPos = new Vector(0, 0);

        this._arrowPos = new Vector(0.5, 0.5);

        this._drawViewport = false;
        const int = setInterval(() => {
            if (window.input === undefined) return;
            clearInterval(int);
            window.input.set_convar('ren_minimap_viewport', true);
            window.input.set_convar = new Proxy(window.input.set_convar, {
                apply: (target, thisArg, args) => {
                    if (args[0] === 'ren_minimap_viewport') this._drawViewport = args[1];
                    else Reflect.apply(target, thisArg, args);
                },
            });
        }, 10);

        this._minimapHook();
        this._viewportHook();
        this._arrowHook();
    }

    get minimapDim() {
        return this._minimapDim;
    }

    get minimapPos() {
        return this._minimapPos;
    }

    get viewportDim() {
        return this._viewportDim;
    }

    get viewportPos() {
        return this._viewportPos;
    }

    /**
     * @returns The position of the arrow normalized to the range [0,1]
     */
    get arrowPos() {
        return this._arrowPos;
    }

    drawViewport(value) {
        this._drawViewport = value;
    }

    _minimapHook() {
        CanvasKit.hook('strokeRect', (target, thisArg, args) => {
            const transform = thisArg.getTransform();

            this._minimapDim = new Vector(transform.a, transform.d);
            this._minimapPos = new Vector(transform.e, transform.f);
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

            this._viewportDim = new Vector(transform.a, transform.d);
            this._viewportPos = new Vector(transform.e, transform.f);

            if (this._drawViewport) return Reflect.apply(target, thisArg, args);
        });
    }

    _arrowHook() {
        let index = 0;

        let pointA;
        let pointB;
        let pointC;

        const calculatePos = () => {
            const side1 = Math.round(Vector.distance(pointA, pointB));
            const side2 = Math.round(Vector.distance(pointA, pointC));
            const side3 = Math.round(Vector.distance(pointB, pointC));
            if (side1 === side2 && side2 === side3) return;

            const centroid = Vector.centroid(pointA, pointB, pointC);
            const arrowPos = Vector.subtract(centroid, this._minimapPos);
            const position = Vector.divide(arrowPos, this._minimapDim);

            this._arrowPos = position;
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
