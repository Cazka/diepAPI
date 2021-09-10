import { Vector } from './vector';
import { CanvasKit } from './canvas_kit';

class ArenaScaling {
    #scalingFactor = 1;

    constructor() {
        CanvasKit.hook('stroke', (target, thisArg, args) => {
            if (thisArg.fillStyle === '#cdcdcd' && thisArg.globalAlpha !== 0) {
                this.#scalingFactor = thisArg.globalAlpha * 10;
            }
        });
    }

    get scalingFactor(): number {
        return this.#scalingFactor;
    }

    get windowRatio(): number {
        return Math.max(window.innerWidth / 1920, window.innerHeight / 1080);
    }

    get fov(): number {
        return this.#scalingFactor / this.windowRatio;
    }

    /**
     *
     * @param {Vector} v The vector in screen units
     * @returns {Vector} The vector in arena units
     */
    toArenaUnits(v: Vector): Vector {
        return Vector.scale(1 / this.#scalingFactor, v);
    }

    /**
     *
     * @param {Vector} v The vector in arena units
     * @returns {Vector} The vector in screen units
     */
    toScreenUnits(v: Vector): Vector {
        return Vector.scale(this.#scalingFactor, v);
    }
}

export const arenaScaling = new ArenaScaling();
