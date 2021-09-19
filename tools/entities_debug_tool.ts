import { EntityType } from 'entity';
import { entityManager, game, arenaScaling, Vector, CanvasKit } from 'index';

class EntityOverlay {
    #canvas: HTMLCanvasElement;
    #ctx: CanvasRenderingContext2D;
    constructor() {
        this.#canvas = CanvasKit.createCanvas();
        this.#ctx = this.#canvas.getContext('2d');
        document.body.appendChild(this.#canvas);

        window.addEventListener('resize', () => this.#onResize());

        game.on('frame', () => this.#onFrame());

        this.#onResize();
    }

    #onResize(): void {
        this.#canvas.width = window.innerWidth;
        this.#canvas.height = window.innerHeight;
    }

    #onFrame() {
        this.#ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        entityManager.entities.forEach((entity) => {
            const position = arenaScaling.toScreenPos(entity.position);
            const futurePos = arenaScaling.toScreenPos(entity.predictPos(performance.now() + 1000));
            const dimensions = arenaScaling.toScreenUnits(
                new Vector(2 * entity.extras.radius, 2 * entity.extras.radius)
            );
            this.#ctx.strokeStyle = 9 === entity.type ? '#ffffff' : entity.extras.color;
            this.#ctx.lineWidth = 5;
            this.#ctx.strokeRect(
                position.x - dimensions.x / 2,
                position.y - dimensions.y / 2,
                dimensions.x,
                dimensions.y
            );

            this.#ctx.strokeStyle = '#000000';
            this.#ctx.lineWidth = 3;
            this.#ctx.beginPath();
            this.#ctx.moveTo(position.x, position.y);
            this.#ctx.lineTo(futurePos.x, futurePos.y);
            this.#ctx.stroke();
        });
    }
}

const overlay = new EntityOverlay();
