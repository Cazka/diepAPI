import { Vector } from '../core/vector';
import { Entity, EntityType } from '../types/entity';

import { scaling } from '../apis/scaling';
import { game } from '../apis/game';

import { Overlay } from '../tools/overlay';

import { entityManager } from './entity_manager';
import { Extension } from './extension';

class DebugTool extends Extension {
    #overlay: Overlay;
    #ctx: CanvasRenderingContext2D;

    #drawBoundingBox = false;
    #drawVelocity = false;
    #drawParent = false;
    #drawInfo = false;

    constructor() {
        super(() => {
            entityManager.load();

            this.#overlay = new Overlay();
            this.#ctx = this.#overlay.ctx;

            game.on('frame', () => {
                entityManager.entities.forEach((entity) => {
                    const position = scaling.toCanvasPos(entity.position);
                    const futurePos = scaling.toCanvasPos(entity.predictPos(1000));
                    const dimensions = scaling.toCanvasUnits(
                        new Vector(2 * entity.extras.radius, 2 * entity.extras.radius)
                    );

                    if (this.#drawBoundingBox) {
                        this.#_drawboundingBox(entity, position, dimensions);
                    }

                    if (this.#drawVelocity) {
                        this.#_drawVelocity(position, futurePos);
                    }

                    if (this.#drawParent) {
                        this.#_drawParent(entity, futurePos);
                    }

                    if (this.#drawInfo) {
                        this.#_drawInfo(entity, position, dimensions);
                    }
                });
            });
        });
    }

    drawAll(v: boolean): void {
        this.#drawBoundingBox = v;
        this.#drawVelocity = v;
        this.#drawParent = v;
        this.#drawInfo = v;
    }

    drawBoundingBox(v: boolean): void {
        this.#drawBoundingBox = v;
    }

    drawVelocity(v: boolean): void {
        this.#drawVelocity = v;
    }

    drawParent(v: boolean): void {
        this.#drawParent = v;
    }

    drawInfo(v: boolean): void {
        this.#drawInfo = v;
    }

    #_drawboundingBox(entity: Entity, position: Vector, dimensions: Vector) {
        this.#ctx.save();

        this.#ctx.strokeStyle = entity.type === EntityType.UNKNOWN ? '#ffffff' : entity.extras.color;
        this.#ctx.lineWidth = scaling.toCanvasUnits(new Vector(3, 3)).x;

        this.#ctx.strokeRect(position.x - dimensions.x / 2, position.y - dimensions.y / 2, dimensions.x, dimensions.y);

        this.#ctx.restore();
    }

    #_drawVelocity(position: Vector, futurePos: Vector) {
        this.#ctx.save();

        this.#ctx.strokeStyle = '#000000';
        this.#ctx.lineWidth = scaling.toCanvasUnits(new Vector(3, 3)).x;

        this.#ctx.beginPath();
        this.#ctx.moveTo(position.x, position.y);
        this.#ctx.lineTo(futurePos.x, futurePos.y);
        this.#ctx.stroke();

        this.#ctx.restore();
    }

    #_drawParent(entity: Entity, position: Vector) {
        if (entity.parent === null) {
            return;
        }

        const parentPos = scaling.toCanvasPos(entity.parent.position);

        this.#ctx.save();

        this.#ctx.strokeStyle = '#8aff69';
        this.#ctx.lineWidth = scaling.toCanvasUnits(new Vector(3, 3)).x;

        this.#ctx.beginPath();
        this.#ctx.moveTo(position.x, position.y);
        this.#ctx.lineTo(parentPos.x, parentPos.y);
        this.#ctx.stroke();

        this.#ctx.restore();
    }

    #_drawInfo(entity: Entity, position: Vector, dimensions: Vector) {
        this.#ctx.save();

        this.#ctx.font = scaling.toCanvasUnits(new Vector(30, 30)).x + 'px Ubuntu';

        this.#ctx.fillText(
            `${entity.extras.id} ${Math.floor((performance.now() - entity.extras.timestamp) / 1000)}`,
            position.x,
            position.y - dimensions.y * 0.7
        );

        this.#ctx.restore();
    }
}

export const debugTool = new DebugTool();
