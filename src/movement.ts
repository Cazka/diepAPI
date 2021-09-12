import { Vector } from './vector';

export class Movement {
    #position = new Vector(0, 0);
    #velocity = new Vector(0, 0);

    /*
     * used for average velocity calculation
     */
    readonly #velocitySamplesSize = 10;
    #velocitySamples = Array(this.#velocitySamplesSize).fill(new Vector(0, 0));
    #velocitySamplesIndex = 0;
    #velocityLastNow = performance.now();

    get position(): Vector {
        return this.#position;
    }

    get velocity(): Vector {
        return this.#velocity;
    }

    protected updatePos(newPos: Vector): void {
        this.#updateVelocity(newPos);
        this.#position = newPos;
    }

    #updateVelocity(newPos: Vector): void {
        const now = performance.now();
        const time = (now - this.#velocityLastNow) / 1000;
        this.#velocityLastNow = now;

        const velocity = Vector.scale(1 / time, Vector.subtract(newPos, this.#position));

        // add current velocity to our samples array
        this.#velocitySamples[this.#velocitySamplesIndex++] = velocity;
        this.#velocitySamplesIndex %= this.#velocitySamples.length;

        // calculate the average velocity
        this.#velocity = Vector.scale(
            1 / this.#velocitySamples.length,
            this.#velocitySamples.reduce((acc, x) => Vector.add(acc, x))
        );
    }
}
