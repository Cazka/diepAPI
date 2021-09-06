import Vector from './vector.ts';
import CanvasKit from './canvasKit.mjs';

let instance = null;

export default class ArenaScaling {
    constructor() {
        if (instance) return instance;
        instance = this;

        this._scalingFactor = 1;

        CanvasKit.hook('stroke', (target, thisArg, args) => {
            if (thisArg.fillStyle === '#cdcdcd' && thisArg.globalAlpha !== 0) {
                this._scalingFactor = thisArg.globalAlpha * 10;
            }
        });
    }

    /**
     * @returns {number} The scaling factor
     */
    get scalingFactor() {
        return this._scalingFactor;
    }

    /**
     * @returns {number} The window ratio
     */
    get windowRatio() {
        return Math.max(window.innerWidth / 1920, window.innerHeight / 1080);
    }

    /**
     * @returns {number} The player fov
     */
    get fov() {
        return this.scalingFactor / this.windowRatio;
    }

    /**
     *
     * @param {Vector} v The vector in screen units
     * @returns {Vector} The vector in arena units
     */
    toArenaUnits(v) {
        return Vector.scale(1 / this._scalingFactor, v);
    }

    /**
     *
     * @param {Vector} v The vector in arena units
     * @returns {Vector} The vector in screen units
     */
    toScreenUnits(v) {
        return Vector.scale(this._scalingFactor, v);
    }
}
