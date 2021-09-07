import Vector from './vector.ts';

export default class Movement {
    constructor() {
        this._position = new Vector(0, 0);
        this._velocity = new Vector(0, 0);

        this._velocitySamples = Array(10).fill(this._velocity);
        this._velocitySamplesIndex = 0;
        this._velocityLastTime = Date.now();
    }

    /**
     * @returns {Vector}
     */
    get position() {
        return this._position;
    }

    /**
     * @returns {Vector}
     */
    get velocity() {
        return this._velocity;
    }

    /**
     *
     * @param {Vector} newPos The new position
     */
    updatePos(newPos) {
        this._updateVelocity(newPos);
        this._position = newPos;
    }

    /**
     *
     * @param {Vector} newPos The new position
     * @private
     */
    _updateVelocity(newPos) {
        const timeNow = Date.now();
        const time = (timeNow - this._velocityLastTime) / 1000;
        this._velocityLastTime = timeNow;

        const velocity = Vector.scale(1 / time, Vector.subtract(newPos, this._position));

        // add current velocity to our samples array
        this._velocitySamples[this._velocitySamplesIndex] = velocity;
        this._velocitySamplesIndex = (this._velocitySamplesIndex + 1) % this._velocitySamples.length;

        // calculate the average velocity
        this._velocity = Vector.scale(
            1 / this._velocitySamples.length,
            this._velocitySamples.reduce((acc, x) => Vector.add(acc, x))
        );
    }
}
