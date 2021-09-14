import { entityManager, game } from '../src/index';

class EntityOverlay {
    #canvas: HTMLCanvasElement;
    #ctx: CanvasRenderingContext2D;
    constructor() {
        this.#canvas = document.createElement('canvas');
        this.#canvas.style.position = 'absolute';
        this.#canvas.style.top = '0px';
        this.#canvas.style.left = '0px';
        this.#canvas.style.right = '0px';
        this.#canvas.style.bottom = '0px';
        this.#canvas.style.width = '100%';
        this.#canvas.style.height = '100%';

        this.#ctx = this.#canvas.getContext('2d');
        document.body.appendChild(this.#canvas);

        window.addEventListener('resize', () => this.#onResize());

        game.on('frame', () => {});

        this.#onResize();
        this.#testScreen();
    }

    #onResize(): void {
        this.#canvas.width = window.innerWidth;
        this.#canvas.height = window.innerHeight;
    }

    #testScreen(): void {
        const img = new Image();
        img.src = 'https://openclipart.org/image/2400px/svg_to_png/19972/ivak-TV-Test-Screen.png';

        this.#ctx.drawImage(img, 0, 0, this.#canvas.width, this.#canvas.height);
    }
}

const overlay = new EntityOverlay();
