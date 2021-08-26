import Vector from './vector.mjs';
import CanvasKit from './canvasKit.mjs';
import ArenaScaling from './arenaScaling.mjs';
import Minimap from './minimap.mjs';

let instance = null;

export default class Arena {
    constructor() {
        if (instance) return instance;
        instance = this;

        const minimap = new Minimap();
        const arenaScaling = new ArenaScaling();

        this._size = 1;

        CanvasKit.hookRAF((target, thisArg, args) => {
            const ratio = Vector.divide(minimap.minimapDim, minimap.viewportDim);
            const arenaDim = Vector.multiply(ratio, new Vector(window.innerWidth, window.innerHeight));
            const arenaSize = Vector.round(arenaScaling.toArenaUnits(arenaDim));
            this._size = arenaSize.x;
        });
    }

    /**
     * @returns {number} The Arena size in arena units
     */
    get size() {
        return this._size;
    }

    //These methods are not much used. can be moved to playerMovement.mjs where its currently only used.
    /**
     *
     * @param {Vector} vector The vector in [0, 1] coordinates
     * @returns {Vector} The scaled vector in [-Arena.size/2, Arena.size/2] coordinates
     */
    scale(vector) {
        const scale = (value) => Math.round(this._size * (value - 0.5));
        return new Vector(scale(vector.x), scale(vector.y));
    }
    /**
     *
     * @param {Vector} vector - The scaled vector in [-Arena.size/2, Arena.size/2] coordinates
     * @returns {Vector} The unscaled vector in [0, 1] coordinates
     */
    unscale(vector) {
        const unscale = (value) => value / this._size + 0.5;
        return new Vector(unscale(vector.x), unscale(vector.y));
    }
}
