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
            const dimensions = arenaScaling.toScreenUnits(new Vector(100, 100));
            this.#ctx.strokeStyle = '#ff0000';
            this.#ctx.lineWidth = 5;
            this.#ctx.strokeRect(position.x, position.y, dimensions.x, dimensions.y);
        });
    }
}

const overlay = new EntityOverlay();
