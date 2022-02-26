import { Vector } from './vector';
import { CanvasKit } from './canvas_kit';
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
     * @param {Vector} v The vector in canvas units
     * @returns {Vector} The vector in arena units
     */
    toArenaUnits(v: Vector): Vector {
        return Vector.scale(1 / this.#scalingFactor, v);
    }

    /**
     *
     * @param {Vector} v The vector in arena units
     * @returns {Vector} The vector in canvas units
     */
    toCanvasUnits(v: Vector): Vector {
        return Vector.scale(this.#scalingFactor, v);
    }

    /**
     * Will translate coordinates from canvas to arena
     * @param {Vector} canvasPos The canvas coordinates
     * @returns {Vector} The `canvasPos` translated to arena coordinates
     */
    toArenaPos(canvasPos: Vector): Vector {
        const direction = Vector.subtract(
            canvasPos,
            this.screenToCanvas(new Vector(window.innerWidth / 2, window.innerHeight / 2))
        );
        const scaled = this.toArenaUnits(direction);
        const arenaPos = Vector.add(scaled, camera.position);

        return arenaPos;
    }

    /**
     * Will translate coordinates from arena to canvas
     * @param {Vector} arenaPos The arena coordinates
     * @returns {Vector} The `arenaPos` translated to canvas coordinates
     */
    toCanvasPos(arenaPos: Vector): Vector {
        const direction = Vector.subtract(arenaPos, camera.position);
        const scaled = this.toCanvasUnits(direction);
        const canvasPos = Vector.add(
            scaled,
            this.screenToCanvas(new Vector(window.innerWidth / 2, window.innerHeight / 2))
        );

        return canvasPos;
    }

    screenToCanvasUnits(n: number) {
        return n * window.devicePixelRatio;
    }

    canvasToScreenUnits(n: number) {
        return n / window.devicePixelRatio;
    }

    /**
     * Will translate coordinates from screen to canvas
     * @param v The screen coordinates
     * @returns The canvas coordinates
     */
    screenToCanvas(v: Vector) {
        return Vector.scale(window.devicePixelRatio, v);
    }

    /**
     * Will translate coordinates from canvas to screen
     * @param v The canvas coordinates
     * @returns the screen coordinates
     */
    canvasToScreen(v: Vector) {
        return Vector.scale(1 / window.devicePixelRatio, v);
    }
}

export const arenaScaling = new ArenaScaling();
