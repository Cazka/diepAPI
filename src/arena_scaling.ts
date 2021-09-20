import { Vector } from './vector';
import { CanvasKit } from './canvas_kit';
import { playerMovement } from './player_movement';
import { camera } from './camera';

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

    /**
     * Will translate coordinates from canvas to arena
     * @param {Vector} screenPos The canvas coordinates
     * @returns {Vector} The `screenPos` translated to arena coordinates
     */
    toArenaPos(screenPos: Vector): Vector {
        const direction = Vector.subtract(screenPos, new Vector(window.innerWidth / 2, window.innerHeight / 2));
        const scaled = this.toArenaUnits(direction);
        const arenaPos = Vector.add(scaled, camera.position);

        return arenaPos;
    }

    /**
     * Will translate coordinates from arena to canvas
     * @param {Vector} arenaPos The arena coordinates
     * @returns {Vector} The `arenaPos` translated to canvas coordinates
     */
    toScreenPos(arenaPos: Vector): Vector {
        const direction = Vector.subtract(arenaPos, camera.position);
        const scaled = this.toScreenUnits(direction);
        const screenPos = Vector.add(scaled, new Vector(window.innerWidth / 2, window.innerHeight / 2));

        return screenPos;
    }
}

export const arenaScaling = new ArenaScaling();
