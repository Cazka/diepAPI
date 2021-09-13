import { Vector } from './vector';
import { CanvasKit } from './canvas_kit';
import { Entity, EntityType } from './entity';
import { arenaScaling } from './arena_scaling';
import { game } from './game';
import { player } from './player';

class MaxHeap<T> {
    #heap: T[] = [];

    constructor(readonly comparator: (e1: T, e2: T) => number) {}

    get array(): T[] {
        return this.#heap;
    }

    add(element: T): void {
        this.#heap.push(element);
        this.#heapifyUp(this.#heap.length - 1);
    }

    #heapifyUp(i: number): void {
        while (true) {
            const parent = Math.floor(i / 2);
            if (i > 0 && this.comparator(this.#heap[i], this.#heap[parent]) < 0) {
                [this.#heap[i], this.#heap[parent]] = [this.#heap[parent], this.#heap[i]];
                i = parent;
            } else {
                break;
            }
        }
    }
}
class PriorityQueue {
    #heap: MaxHeap<Entity> = new MaxHeap(
        (e1, e2) => Vector.distance(e1.position, player.position) - Vector.distance(e2.position, player.position)
    );

    add(entity: Entity) {
        this.#heap.add(entity);
    }
}
/**
 * Entity Manager is used to access the information about the entities, that are currently drawn on the screen.
 * To access the entities the EntityManager exposes the EntityManager.entities field.
 *
 * EntityMananger.entities:
 * This represents a priority queue, where the entity with the shortest distance to the player is first
 * and the entity with the largest distance is last. entities[0] will therefor always be the own player.
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
    //#entities = new PriorityQueue();

    constructor() {
        //When is a triangle drawn?
        // - moveTo -> lineTo -> lineTo -> fill
        this.#triangleHook();

        //When is a hexagon being drawn?

        //when is a square being drawn?

        //when is a bullet being drawn?

        //when is a player drawn?

        game.on('frame', () => {
            //we should remove entities that havent been updated in the previous frame.
        });
    }

    #add(type: EntityType, position: Vector) {
        //find closest entity in this.#entities to position. (entity.predict(performance.now()))
        // - found? -> update entity position;
        // - not found? -> create new entity
        //
        //this already looks like a performance critical place, since there are many calculations that have to be done on every frame.
    }

    #triangleHook(): void {
        let index = 0;

        let pointA: Vector;
        let pointB: Vector;
        let pointC: Vector;

        const calculatePos = (ctx: CanvasRenderingContext2D) => {
            const side1 = Math.round(Vector.distance(pointA, pointB));
            const side2 = Math.round(Vector.distance(pointA, pointC));
            const side3 = Math.round(Vector.distance(pointB, pointC));
            //ignore Minimap Arrow
            if (side1 !== side2 || side2 !== side3) return;
            //ignore Leader Arrow
            if (ctx.fillStyle === '#000000') return;

            pointA = arenaScaling.toArenaPos(pointA);
            pointB = arenaScaling.toArenaPos(pointB);
            pointC = arenaScaling.toArenaPos(pointC);

            const position = Vector.centroid(pointA, pointB, pointC);
            const radius = Math.round(Vector.radius(pointA, pointB, pointC));

            let type: EntityType;
            switch (radius) {
                case 23:
                    //battleship drone
                    type = EntityType.Drone;
                    break;
                case 30:
                    //base drone
                    type = EntityType.Drone;
                    break;
                case 35:
                    //small crasher
                    type = EntityType.Crasher;
                    break;
                case 40:
                case 41:
                case 42:
                case 43:
                case 44:
                case 45:
                case 46:
                    //overseer/overlord drone
                    type = EntityType.Drone;
                    break;
                case 55:
                    if (ctx.fillStyle === '#f177dd') {
                        //big crasher
                        type = EntityType.Crasher;
                    } else {
                        //triangle
                        type = EntityType.Triangle;
                    }
                    break;
                default:
                    break;
            }
            this.#add(type, position);
        };

        CanvasKit.hook('beginPath', (target, thisArg, args) => {
            index = 1;
        });
        CanvasKit.hook('moveTo', (target, thisArg, args) => {
            if (index === 1) {
                index++;
                pointA = new Vector(args[0], args[1]);
                return;
            }
            index = 0;
        });
        CanvasKit.hook('lineTo', (target, thisArg, args) => {
            if (index === 2) {
                index++;
                pointB = new Vector(args[0], args[1]);
                return;
            }
            if (index === 3) {
                index++;
                pointC = new Vector(args[0], args[1]);
                return;
            }
            index = 0;
        });
        CanvasKit.hook('fill', (target, thisArg, args) => {
            if (index === 4) {
                index++;
                calculatePos(thisArg);
                return;
            }
            index = 0;
        });
    }
}

export const entityManager = new EntityManager();
