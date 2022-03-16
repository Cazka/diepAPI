import { entityManager, game, arenaScaling, Vector, CanvasKit } from 'index';

entityManager.initialize();

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
        this.#canvas.width = window.innerWidth * window.devicePixelRatio;
        this.#canvas.height = window.innerHeight * window.devicePixelRatio;
    }

    #onFrame() {
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        entityManager.entities.forEach((entity) => {
            const position = arenaScaling.toCanvasPos(entity.position);
            const futurePos = arenaScaling.toCanvasPos(entity.predictPos(1000));
            const dimensions = arenaScaling.toCanvasUnits(
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

            //velocity
            this.#ctx.strokeStyle = '#000000';
            this.#ctx.lineWidth = 3;
            this.#ctx.beginPath();
            this.#ctx.moveTo(position.x, position.y);
            this.#ctx.lineTo(futurePos.x, futurePos.y);
            this.#ctx.stroke();

            // parent
            if (entity.parent !== null) {
                const parentPos = arenaScaling.toCanvasPos(entity.parent.position);

                this.#ctx.strokeStyle = '#8aff69';
                this.#ctx.lineWidth = 3;
                this.#ctx.beginPath();
                this.#ctx.moveTo(position.x, position.y);
                this.#ctx.lineTo(parentPos.x, parentPos.y);
                this.#ctx.stroke();
            }

            //Time alive + id
            const fontSize = arenaScaling.toCanvasUnits(new Vector(30, 30));
            this.#ctx.font = fontSize.x + 'px Ubuntu';
            this.#ctx.fillText(
                `${entity.extras.id} ${Math.floor((performance.now() - entity.extras.timestamp) / 1000)}`,
                position.x,
                position.y - dimensions.y * 0.7
            );
        });
    }
}

const overlay = new EntityOverlay();
