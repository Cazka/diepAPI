import { CanvasKit } from '../core/canvas_kit';

import { game } from '../apis/game';

class BackgroundOverlay {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    #gameCanvas: HTMLCanvasElement;
    #gameContext: CanvasRenderingContext2D;

    constructor() {
        this.canvas = CanvasKit.createCanvas();
        this.ctx = this.canvas.getContext('2d');

        _window.addEventListener('resize', () => this.#onResize());
        game.on('frame', () => this.#onFrame());
        this.#onResize();

        game.once('ready', () => {
            this.#gameCanvas = document.getElementById('canvas') as HTMLCanvasElement;
            this.#gameContext = this.#gameCanvas.getContext('2d');
            this.#hookBackground();
        });
    }

    #onResize() {
        this.canvas.width = _window.innerWidth * _window.devicePixelRatio;
        this.canvas.height = _window.innerHeight * _window.devicePixelRatio;
    }

    #onFrame() {
        this.canvas.width = _window.innerWidth * _window.devicePixelRatio;
        this.canvas.height = _window.innerHeight * _window.devicePixelRatio;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    #hookBackground() {
        CanvasKit.overrideCtx('fillRect', (target, thisArg, args) => {
            if (typeof thisArg.fillStyle !== 'object') {
                return Reflect.apply(target, thisArg, args);
            }
            const result = Reflect.apply(target, thisArg, args);

            this.#gameContext.save();
            this.#gameContext.setTransform(1, 0, 0, 1, 0, 0);
            this.#gameContext.globalAlpha = 1;
            this.#gameContext.drawImage(this.canvas, 0, 0);
            this.#gameContext.restore();

            return result;
        });
    }
}

export const backgroundOverlay = new BackgroundOverlay();
