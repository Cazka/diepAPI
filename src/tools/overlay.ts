import { CanvasKit } from '../core/canvas_kit';

import { game } from '../apis/game';

class Overlay {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    constructor() {
        this.canvas = CanvasKit.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
        _window.addEventListener('resize', () => this.#onResize());
        game.on('frame', () => this.#onFrame());
        this.#onResize();
    }

    #onResize() {
        this.canvas.width = _window.innerWidth * _window.devicePixelRatio;
        this.canvas.height = _window.innerHeight * _window.devicePixelRatio;
    }

    #onFrame() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export { Overlay };
