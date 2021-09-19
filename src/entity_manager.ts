import { Vector } from './vector';
import { CanvasKit } from './canvas_kit';
import { Entity, EntityType, EntityColor, TeamColors } from './entity';
import { arenaScaling } from './arena_scaling';
import { game } from './game';

/**
 * Entity Manager is used to access the information about the entities, that are currently drawn on the screen.
 * To access the entities the EntityManager exposes the EntityManager.entities field.
 *
 * EntityMananger.entities:
 * Important!: We expect the camera coordinates to match with the player coordinates. Tanks like Predator will cause
 * unexpected behaviour.
 *
 * Entity:
 * Entity.position will work even when the player position is unknown.
 * if the player position is unknown we assume the player is at Vector(0,0) and the entity position will be relative to Vector(0,0).
 * if the player position is known (Minimap) the entity.position will be the true position in the arena.
 *
 */
class EntityManager {
    #entities: Entity[] = [];
    #entitiesUpdated: Entity[] = [];

    constructor() {
        this.#triangleHook();

        this.#squareHook();

        this.#pentagonHook();

        //when is a bullet being drawn?

        //when is a player being drawn?

        game.on('frame', () => {
            this.#entities = this.#entitiesUpdated;
            this.#entitiesUpdated = [];
        });
    }

    get entities(): Entity[] {
        return this.#entities;
    }

    /**
     * Adds the entity to `#entitiesUpdated`.
     *
     * Will either find the entity in `#entities` or create a new `Entity`.
     */
    #add(type: EntityType, position: Vector, extras: object = {}) {
        const entityIndex = this.#findEntity(type, position);

        let entity: Entity;
        if (entityIndex === -1) {
            entity = new Entity(type, extras);
        } else {
            entity = this.#entities[entityIndex];
        }

        entity.updatePos(position);
        this.#entitiesUpdated.push(entity);
    }

    /**
     * Searches `#entities` for the entity that is closest to `position` and
     * returns the __index__ of that entity or __-1__ if there is no match.
     */
    #findEntity(type: EntityType, position: Vector): number {
        let result = -1;
        let shortestDistance = Number.MAX_SAFE_INTEGER;

        this.#entities.forEach((x, i) => {
            const distance = Vector.distance(x.predictPos(performance.now()), position);

            if (distance < shortestDistance) {
                shortestDistance = distance;
                result = i;
            }
        });

        //if distance is too high
        if (shortestDistance > 5 /* precision */) {
            return -1;
        }
        //sanity check
        if (/*EntityType.UNKNOWN !== type &&*/ this.#entities[result].type !== type) {
            return -1;
        }

        return result;
    }

    /**
     * Will call the cb method, when a polygon with `numVertices` vertices is drawn.
     */
    #createPolygonHook(numVertices: number, cb: (vertices: Vector[], ctx: CanvasRenderingContext2D) => void): void {
        let index = 0;

        let vertices: Vector[] = [];

        const onFillPolygon = (ctx: CanvasRenderingContext2D) => {
            cb(vertices, ctx);
        };

        CanvasKit.hook('beginPath', (target, thisArg, args) => {
            index = 1;
            vertices = [];
        });
        CanvasKit.hook('moveTo', (target, thisArg, args) => {
            if (index === 1) {
                index++;
                vertices.push(new Vector(args[0], args[1]));
                return;
            }
            index = 0;
        });
        CanvasKit.hook('lineTo', (target, thisArg, args) => {
            if (index >= 2 && index <= numVertices) {
                index++;
                vertices.push(new Vector(args[0], args[1]));
                return;
            }
            index = 0;
        });
        CanvasKit.hook('fill', (target, thisArg, args) => {
            if (index === numVertices + 1) {
                index++;
                onFillPolygon(thisArg);
                return;
            }
            index = 0;
        });
    }

    #triangleHook(): void {
        this.#createPolygonHook(3, (vertices, ctx) => {
            const side1 = Math.round(Vector.distance(vertices[0], vertices[1]));
            const side2 = Math.round(Vector.distance(vertices[0], vertices[2]));
            const side3 = Math.round(Vector.distance(vertices[1], vertices[2]));
            //ignore Minimap Arrow
            if (side1 !== side2 || side2 !== side3) return;
            //ignore Leader Arrow
            if ('#000000' === ctx.fillStyle) return;

            vertices = vertices.map((x) => arenaScaling.toArenaPos(x));

            const position = Vector.centroid(...vertices);
            const radius = Math.round(Vector.radius(...vertices));
            const color = ctx.fillStyle as EntityColor;

            let type: EntityType;
            switch (radius) {
                case 23:
                    //battleship drone
                    if (TeamColors.includes(color)) type = EntityType.Drone;
                    break;
                case 30:
                    //base drone
                    if (TeamColors.includes(color)) type = EntityType.Drone;
                    break;
                case 35:
                    //small crasher
                    if (EntityColor.Crasher === color) type = EntityType.Crasher;
                    break;
                case 40:
                case 41:
                case 42:
                case 43:
                case 44:
                case 45:
                case 46:
                    //overseer/overlord drone
                    if (TeamColors.includes(color)) type = EntityType.Drone;
                    break;
                case 55:
                    //big crasher
                    if (EntityColor.Crasher === color) type = EntityType.Crasher;
                    //triangle
                    if (EntityColor.Triangle === color) type = EntityType.Triangle;
                    break;
            }
            if (type === undefined) type = EntityType.UNKNOWN;
            this.#add(type, position, { color, radius });
        });
    }

    #squareHook(): void {
        this.#createPolygonHook(4, (vertices, ctx) => {
            vertices = vertices.map((x) => arenaScaling.toArenaPos(x));

            const position = Vector.centroid(...vertices);
            const radius = Math.round(Vector.radius(...vertices));
            const color = ctx.fillStyle as EntityColor;

            let type: EntityType;
            switch (radius) {
                case 55:
                    //square
                    if (EntityColor.Square === color) type = EntityType.Square;
                    //necromancer drone
                    if (TeamColors.includes(color) || EntityColor.NecromancerDrone === color) type = EntityType.Drone;
                    break;
            }
            if (type === undefined) type = EntityType.UNKNOWN;
            this.#add(type, position, { color, radius });
        });
    }

    #pentagonHook(): void {
        this.#createPolygonHook(5, (vertices, ctx) => {
            vertices = vertices.map((x) => arenaScaling.toArenaPos(x));

            const position = Vector.centroid(...vertices);
            const radius = Math.round(Vector.radius(...vertices));
            const color = ctx.fillStyle as EntityColor;

            let type: EntityType;
            switch (radius) {
                case 75:
                    if (EntityColor.Pentagon === color) type = EntityType.Pentagon;
                    break;
                case 200:
                    if (EntityColor.AlphaPentagon === color) type = EntityType.AlphaPentagon;
                    break;
            }
            if (type === undefined) type = EntityType.UNKNOWN;
            this.#add(type, position, { color, radius });
        });
    }
}

export const entityManager = new EntityManager();
