export default class Vector {
    /**
     * Vector is immutable
     *
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        Object.freeze(this);
    }

    /**
     * Factory function
     *
     * @param {number} x
     * @param {number} y
     * @returns {Vector}
     */
    static from(x, y) {
        return new Vector(x, y);
    }

    /**
     * ( u1 ) + ( v1 ) = ( u1 + v1 )
     * ( u2 )   ( v2 )   ( u2 + v2 )
     *
     * @param {Vector} u
     * @param {Vector} v
     * @returns {Vector}
     */
    static add(u, v) {
        return new Vector(u.x + v.x, u.y + v.y);
    }

    /**
     * ( u1 ) - ( v1 ) = ( u1 - v1 )
     * ( u2 )   ( v2 )   ( u2 - v2 )
     *
     * @param {Vector} u
     * @param {Vector} v
     * @returns {Vector}
     */
    static subtract(u, v) {
        return new Vector(u.x - v.x, u.y - v.y);
    }

    /**
     * ( u1 ) * ( v1 ) = ( u1 * v1 )
     * ( u2 )   ( v2 )   ( u2 * v2 )
     *
     * @param {Vector} u
     * @param {Vector} v
     * @returns {Vector}
     */
    static multiply(u, v) {
        return new Vector(u.x * v.x, u.y * v.y);
    }

    /**
     * ( u1 ) / ( v1 ) = ( u1 / v1 )
     * ( u2 )   ( v2 )   ( u2 / v2 )
     *
     * @param {Vector} u
     * @param {Vector} v
     * @returns {Vector}
     */
    static divide(u, v) {
        return new Vector(u.x / v.x, u.y / v.y);
    }

    /**
     * r * ( v1 ) = ( r * v1 )
     *     ( v2 )   ( r * v2 )
     *
     * @param {number} r
     * @param {Vector} v
     * @returns {Vector}
     */
    static scale(r, v) {
        return new Vector(r * v.x, r * v.y);
    }

    /**
     *
     * @param {Vector} v
     * @returns {Vector}
     */
    static round(v) {
        return new Vector(Math.round(v.x), Math.round(v.y));
    }
    /**
     *
     * @param {Vector} v
     * @returns {number}
     */
    static length(v) {
        return Math.sqrt(v.x ** 2 + v.y ** 2);
    }

    /**
     *
     * @param {Vector} u
     * @param {Vector} v
     * @returns {number} The Euclidean distance between the two vectors
     */
    static distance(u, v) {
        return Vector.length(Vector.subtract(u, v));
    }

    /**
     * Calculates the [centroid](https://en.wikipedia.org/wiki/Centroid)
     *
     * @param  {...Vector} vertices
     * @returns {Vector}
     */
    static centroid(...vertices) {
        const sum = vertices.reduce((acc, vec) => Vector.add(acc, vec), new Vector(0, 0));

        const centroid = Vector.scale(1 / vertices.length, sum);

        return centroid;
    }

    /**
     *
     * @param  {...Vector} vertices
     * @returns {number}
     */
    static radius(...vertices) {
        const centroid = Vector.centroid(...vertices);

        const distance = vertices.reduce((acc, vec) => acc + Vector.distance(centroid, vec), 0);

        const radius = distance / vertices.length;

        return radius;
    }
}
