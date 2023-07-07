import { CanvasKit, Vector } from '../core';
import { game, playerMovement, scaling } from '../apis';
import { Entity, EntityType, EntityColor, TeamColors } from '../types/entity';
import { Extension } from './extension';

const random_id = () => Math.random().toString(36).slice(2, 5);

/**
 * Entity Manager is used to access the information about the entities, that are currently drawn on the screen.
 * To access the entities the EntityManager exposes the EntityManager.entities field.
 */
class EntityManager extends Extension {
    #entities: Entity[] = [];
    #entitiesLastFrame: Entity[] = this.#entities;

    constructor() {
        super(() => {
            game.on('frame_end', () => {
                this.#entitiesLastFrame = this.#entities;
                this.#entities = [];
            });

            this.#triangleHook();

            this.#squareHook();

            this.#pentagonHook();

            //when is a bullet being drawn?

            //when is a player being drawn?
            this.#playerHook();
        });
    }

    get entities(): Entity[] {
        return this.#entities;
    }

    /**
     *
     * @returns The own player entity
     */
    getPlayer(): Entity {
        const player = this.#entities.filter(
            (entity) =>
                entity.type == EntityType.Player && Vector.distance(entity.position, playerMovement.position) < 28
        );

        return player[0];
    }

    /**
     * Adds the entity to `#entities`.
     *
     * Will either find the entity in `#entitiesLastFrame` or create a new `Entity`.
     */
    #add(type: EntityType, position: Vector, extras: object = {}) {
        let entity = this.#findEntity(type, position);

        if (!entity) {
            const parent = this.#findParent(type, position);

            entity = new Entity(type, parent, {
                id: random_id(),
                timestamp: performance.now(),
                ...extras,
            });
        }
        //TODO: remove radius from extras
        entity.extras.radius = (extras as any).radius;

        entity.updatePos(position);
        this.#entities.push(entity);
    }

    /**
     * If an entity is newly created, try to find it's parent entity.
     */
    #findParent(type: EntityType, position: Vector): Entity | undefined {
        if (type == EntityType.Bullet) {
            // TODO: do we want to change the parent entity to EntityType.Barrel in the future?
            return this.#findEntity(EntityType.Player, position, 300);
        }
    }

    /**
     * Searches `#entitiesLastFrame` for the entity that is closest to `position`
     * @returns the entity or null if there is no match.
     */
    #findEntity(type: EntityType, position: Vector, tolerance: number = 42): Entity | undefined {
        let result = undefined;
        let shortestDistance = Infinity;

        this.#entitiesLastFrame.forEach((entity, i) => {
            if (entity.type !== type) return;

            const distance = Vector.distance(entity.position, position);

            if (distance < shortestDistance) {
                shortestDistance = distance;
                result = entity;
            }
        });

        if (shortestDistance > tolerance) {
            return undefined;
        }

        return result;
    }

    #triangleHook(): void {
        CanvasKit.hookPolygon(3, (vertices, ctx) => {
            const side1 = Math.round(Vector.distance(vertices[0], vertices[1]));
            const side2 = Math.round(Vector.distance(vertices[0], vertices[2]));
            const side3 = Math.round(Vector.distance(vertices[1], vertices[2]));
            //ignore minimap arrow
            if (side1 !== side2 || side2 !== side3) return;
            //ignore leader arrow
            if ('#000000' === ctx.fillStyle) return;

            vertices = vertices.map((x) => scaling.toArenaPos(x));

            const position = Vector.centroid(...vertices);
            const radius = Math.round(Vector.radius(...vertices));
            const color = ctx.fillStyle as EntityColor;

            let type = EntityType.UNKNOWN;
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
            
            this.#add(type, position, { color, radius });
        });
    }

    #squareHook(): void {
        CanvasKit.hookPolygon(4, (vertices, ctx) => {
            vertices = vertices.map((x) => scaling.toArenaPos(x));

            const position = Vector.centroid(...vertices);
            const radius = Math.round(Vector.radius(...vertices));
            const color = ctx.fillStyle as EntityColor;

            let type = EntityType.UNKNOWN;
            switch (radius) {
                case 55:
                    //square
                    if (EntityColor.Square === color) type = EntityType.Square;
                    //necromancer drone
                    if (TeamColors.includes(color) || EntityColor.NecromancerDrone === color) type = EntityType.Drone;
                    break;
            }

            this.#add(type, position, { color, radius });
        });
    }

    #pentagonHook(): void {
        CanvasKit.hookPolygon(5, (vertices, ctx) => {
            vertices = vertices.map((x) => scaling.toArenaPos(x));

            const position = Vector.centroid(...vertices);
            const radius = Math.round(Vector.radius(...vertices));
            const color = ctx.fillStyle as EntityColor;

            let type = EntityType.UNKNOWN;
            switch (radius) {
                case 75:
                    if (EntityColor.Pentagon === color) type = EntityType.Pentagon;
                    break;
                case 200:
                    if (EntityColor.AlphaPentagon === color) type = EntityType.AlphaPentagon;
                    break;
            }

            this.#add(type, position, { color, radius });
        });
    }

    #playerHook(): void {
        let index = 0;

        let position: Vector;
        let color: string;
        let radius: number;

        const onCircle = () => {
            position = scaling.toArenaPos(position);
            radius = scaling.toArenaUnits(new Vector(radius, radius)).x;

            let type = EntityType.UNKNOWN;
            if (radius > 53) {
                type = EntityType.Player;
            } else {
                type = EntityType.Bullet;
            }

            this.#add(type, position, {
                color,
                radius,
            });
        };

        //Sequence: beginPath -> arc -> fill -> beginPath -> arc -> fill -> arc
        CanvasKit.hookCtx('beginPath', (target, thisArg, args) => {
            //start
            if (index !== 3) {
                index = 1;
                return;
            }
            if (index === 3) {
                index++;
                return;
            }
            index = 0;
        });
        //check when a circle is drawn.
        CanvasKit.hookCtx('arc', (target, thisArg, args) => {
            //outline
            if (index === 1) {
                index++;
                const transform = thisArg.getTransform();
                position = new Vector(transform.e, transform.f);
                radius = transform.a;
                return;
            }
            if (index === 4) {
                index++;
                color = thisArg.fillStyle as string;
                return;
            }
            //last arc call
            if (index === 6) {
                index++;
                onCircle();
                return;
            }
            index = 0;
        });
        CanvasKit.hookCtx('fill', (target, thisArg, args) => {
            if (index === 2) {
                index++;
                return;
            }
            if (index === 5) {
                index++;
                return;
            }
            index = 0;
        });
    }
}

export const entityManager = new EntityManager();
