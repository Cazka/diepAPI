export class Vector {
    constructor(readonly x: number, readonly y: number) {}

    static len(v: Vector): number {
        return Math.sqrt(v.x ** 2 + v.y ** 2);
    }

    static round(v: Vector): Vector {
        return new Vector(Math.round(v.x), Math.round(v.y));
    }

    static scale(r: number, v: Vector): Vector {
        return new Vector(r * v.x, r * v.y);
    }

    static unscale(r: number, v: Vector): Vector {
        return new Vector(v.x / r, v.y / r);
    }

    static add(u: Vector, v: Vector): Vector {
        return new Vector(u.x + v.x, u.y + v.y);
    }

    static subtract(u: Vector, v: Vector): Vector {
        return new Vector(u.x - v.x, u.y - v.y);
    }

    static multiply(u: Vector, v: Vector): Vector {
        return new Vector(u.x * v.x, u.y * v.y);
    }

    static divide(u: Vector, v: Vector): Vector {
        return new Vector(u.x / v.x, u.y / v.y);
    }

    static distance(u: Vector, v: Vector): number {
        return Vector.len(Vector.subtract(u, v));
    }

    /**
     * Calculates the [centroid](https://en.wikipedia.org/wiki/Centroid)
     */
    static centroid(...vertices: Vector[]): Vector {
        const sum = vertices.reduce((acc, vec) => Vector.add(acc, vec), new Vector(0, 0));

        const centroid = Vector.scale(1 / vertices.length, sum);

        return centroid;
    }

    /**
     * Calcutes the radius from a set of vertices that are placed on a circle
     */
    static radius(...vertices: Vector[]): number {
        const centroid = Vector.centroid(...vertices);

        const distance = vertices.reduce((acc, vec) => acc + Vector.distance(centroid, vec), 0);

        const radius = distance / vertices.length;

        return radius;
    }
}
