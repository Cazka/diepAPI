import { game } from '../apis/game';
import { CanvasKit } from '../core/canvas_kit';

class BackgroundOverlay {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  #gameCanvas: HTMLCanvasElement | undefined | null;
  #gameContext: CanvasRenderingContext2D | undefined | null;

  constructor() {
    this.canvas = CanvasKit.createCanvas();

    const ctx = this.canvas.getContext('2d');
    if (ctx == null) {
      throw new Error('diepAPI: Your browser does not support canvas.');
    }

    this.ctx = ctx;

    _window.addEventListener('resize', () => {
      this.#onResize();
    });
    game.on('frame', () => {
      this.#onFrame();
    });
    this.#onResize();

    game.once('ready', () => {
      this.#gameCanvas = document.getElementById('canvas') as HTMLCanvasElement | null;
      if (this.#gameCanvas == null) {
        throw new Error('diepAPI: Game canvas does not exist.');
      }

      this.#gameContext = this.#gameCanvas.getContext('2d');
      if (this.#gameContext == null) {
        throw new Error('diepAPI: Game canvas context does not exist.');
      }

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
      if (typeof thisArg.fillStyle !== 'object' || this.#gameContext == null) {
        Reflect.apply(target, thisArg, args);
        return;
      }

      Reflect.apply(target, thisArg, args);

      this.#gameContext.save();
      this.#gameContext.setTransform(1, 0, 0, 1, 0, 0);
      this.#gameContext.globalAlpha = 1;
      this.#gameContext.drawImage(this.canvas, 0, 0);
      this.#gameContext.restore();
    });
  }
}

export const backgroundOverlay = new BackgroundOverlay();
