import { Vector } from '../core/vector';
import { Entity, EntityType } from '../types/entity';

import { scaling } from '../apis/scaling';
import { game } from '../apis/game';
import { player } from '../apis/player';

import { overlay } from '../tools/overlay';

import { entityManager } from './entity_manager';
import { Extension } from './extension';

class DebugTool extends Extension {
    #drawBoundingBox = false;
    #drawVelocity = false;
    #drawParent = false;
    #drawInfo = false;
    #drawStats = false;

    constructor() {
        super(() => {
            entityManager.load();

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
                        this.#_drawParent(entity, position);
                    }

                    if (this.#drawInfo) {
                        this.#_drawInfo(entity, position, dimensions);
                    }
                });

                if (this.#drawStats) {
                    this.#_drawStats();
                }
            });
        });
    }

    drawAll(v: boolean): void {
        this.#drawBoundingBox = v;
        this.#drawVelocity = v;
        this.#drawParent = v;
        this.#drawInfo = v;
        this.#drawStats = v;
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

    drawStats(v: boolean): void {
        this.#drawStats = v;
    }

    #_drawboundingBox(entity: Entity, position: Vector, dimensions: Vector) {
        overlay.ctx.save();

        overlay.ctx.strokeStyle = entity.type === EntityType.UNKNOWN ? '#ffffff' : entity.extras.color;
        overlay.ctx.lineWidth = scaling.toCanvasUnits(new Vector(5, 5)).x;

        overlay.ctx.strokeRect(
            position.x - dimensions.x / 2,
            position.y - dimensions.y / 2,
            dimensions.x,
            dimensions.y
        );

        overlay.ctx.restore();
    }

    #_drawVelocity(position: Vector, futurePos: Vector) {
        overlay.ctx.save();

        overlay.ctx.strokeStyle = '#000000';
        overlay.ctx.lineWidth = scaling.toCanvasUnits(new Vector(5, 5)).x;

        overlay.ctx.beginPath();
        overlay.ctx.moveTo(position.x, position.y);
        overlay.ctx.lineTo(futurePos.x, futurePos.y);
        overlay.ctx.stroke();

        overlay.ctx.restore();
    }

    #_drawParent(entity: Entity, position: Vector) {
        if (entity.parent == null) {
            return;
        }

        const parentPos = scaling.toCanvasPos(entity.parent.position);

        overlay.ctx.save();

        overlay.ctx.strokeStyle = '#8aff69';
        overlay.ctx.lineWidth = scaling.toCanvasUnits(new Vector(5, 5)).x;

        overlay.ctx.beginPath();
        overlay.ctx.moveTo(position.x, position.y);
        overlay.ctx.lineTo(parentPos.x, parentPos.y);
        overlay.ctx.stroke();

        overlay.ctx.restore();
    }

    #_drawInfo(entity: Entity, position: Vector, dimensions: Vector) {
        overlay.ctx.save();

        const fontSize = scaling.toCanvasUnits(new Vector(30, 30)).x;

        overlay.ctx.font = fontSize + 'px Ubuntu';
        overlay.ctx.fillStyle = `#ffffff`;
        overlay.ctx.strokeStyle = '#000000';
        overlay.ctx.lineWidth = fontSize / 5;

        overlay.ctx.strokeText(
            `${entity.extras.id} ${Math.floor((performance.now() - entity.extras.timestamp) / 1000)}`,
            position.x,
            position.y - dimensions.y * 0.7
        );

        overlay.ctx.fillText(
            `${entity.extras.id} ${Math.floor((performance.now() - entity.extras.timestamp) / 1000)}`,
            position.x,
            position.y - dimensions.y * 0.7
        );

        overlay.ctx.restore();
    }

    #_drawStats() {
        const text = `Debug Tool:
        Game Info:
        gamemode: ${player.gamemode}
        entities: ${entityManager.entities.length}
        
        Player Info:
        Is dead: ${player.isDead}
        level: ${player.level}
        tank: ${player.tank}
        position: ${Math.round(player.position.x)},${Math.round(player.position.y)}
        mouse: ${Math.round(player.mouse.x)},${Math.round(player.mouse.y)}
        velocity [units/seconds]: ${Math.round(Math.hypot(player.velocity.x, player.velocity.y))}`;

        overlay.ctx.save();

        const fontSize = 20 * _window.devicePixelRatio;

        overlay.ctx.font = `${fontSize}px Ubuntu`;
        overlay.ctx.fillStyle = `#ffffff`;
        overlay.ctx.strokeStyle = '#000000';
        overlay.ctx.lineWidth = fontSize / 5;

        text.split('\n').forEach((x, i) => {
            overlay.ctx.strokeText(x, 0, _window.innerHeight * 0.25 + i * fontSize * 1.05);
            overlay.ctx.fillText(x, 0, _window.innerHeight * 0.25 + i * fontSize * 1.05);
        });

        overlay.ctx.restore();
    }
}

export const debugTool = new DebugTool();
