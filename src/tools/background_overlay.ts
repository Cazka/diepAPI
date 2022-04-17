import { CanvasKit } from '../core/canvas_kit';
import { Overlay } from './overlay';

class BackgroundOverlay extends Overlay {
    #gameCanvas: HTMLCanvasElement;
    #gameContext: CanvasRenderingContext2D;

    constructor() {
        super();

        this.#gameCanvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.#gameContext = this.#gameCanvas.getContext('2d');

        this.#hookBackground();
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

export { BackgroundOverlay };
