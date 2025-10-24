import { game } from '../apis/game';

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve, reject) => setTimeout(resolve, ms));

class Input {
  #gameCanvas: HTMLCanvasElement | undefined;

  constructor() {
    game.once('ready', () => {
      this.#gameCanvas = document.getElementById('canvas') as HTMLCanvasElement;
      if (this.#gameCanvas == null) {
        throw new Error('diepAPI: Game canvas does not exist.');
      }
    });
  }

  keyDown(key: string | number): void {
    if (typeof key == 'string') {
      key = this.#toKeyCode(key);
    }

    const keydown = new KeyboardEvent('keydown', {
      key: '',
      code: '',
      keyCode: key,
      which: key,
      cancelable: true,
      composed: true,
      bubbles: true,
    });

    _window.dispatchEvent(keydown);
  }

  keyUp(key: string | number): void {
    if (typeof key == 'string') {
      key = this.#toKeyCode(key);
    }

    const keyup = new KeyboardEvent('keyup', {
      key: '',
      code: '',
      keyCode: key,
      which: key,
      cancelable: true,
      composed: true,
      bubbles: true,
    });

    _window.dispatchEvent(keyup);
  }

  async keyPress(key: number): Promise<void> {
    this.keyDown(key);
    await sleep(200);
    this.keyUp(key);
    await sleep(10);
  }

  mouse(x: number, y: number): void {
    const mousemove = new MouseEvent('mousemove', {
      clientX: x,
      clientY: y,
      cancelable: true,
      composed: true,
      bubbles: true,
    });

    this.#gameCanvas?.dispatchEvent(mousemove);
  }

  #toKeyCode(key: string): number {
    if (key.length != 1) {
      throw new Error(`diepAPI: Unsupported key: ${key}`);
    }

    return key.toUpperCase().charCodeAt(0);
  }
}

export const input = new Input();
