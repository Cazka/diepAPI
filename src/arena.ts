import { Vector } from './vector';
import { arenaScaling } from './arena_scaling';
import { minimap } from './minimap';
import { game } from './game';

class Arena {
    #size = 1;

    constructor() {
        game.on('frame', () => {
            const ratio = Vector.divide(minimap.minimapDim, minimap.viewportDim);
            const arenaDim = Vector.multiply(ratio, new Vector(window.innerWidth, window.innerHeight));
            const arenaSize = Vector.round(arenaScaling.toArenaUnits(arenaDim));
            this.#size = arenaSize.x;
        });
    }

    /**
     * @returns {number} The Arena size in arena units
     */
    get size(): number {
        return this.#size;
    }

    //These methods are not much used. can be moved to playerMovement.mjs where its currently only used.
    /**
     *
     * @param {Vector} vector The vector in [0, 1] coordinates
     * @returns {Vector} The scaled vector in [-Arena.size/2, Arena.size/2] coordinates
     */
    scale(vector: Vector): Vector {
        const scale = (value) => Math.round(this.#size * (value - 0.5));
        return new Vector(scale(vector.x), scale(vector.y));
    }
    /**
     *
     * @param {Vector} vector - The scaled vector in [-Arena.size/2, Arena.size/2] coordinates
     * @returns {Vector} The unscaled vector in [0, 1] coordinates
     */
    unscale(vector: Vector) {
        const unscale = (value) => value / this.#size + 0.5;
        return new Vector(unscale(vector.x), unscale(vector.y));
    }
}

export const arena = new Arena();
