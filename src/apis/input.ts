import { game } from '../apis/game';

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve, reject) => setTimeout(resolve, ms));

class Input {
  #gameCanvas: HTMLCanvasElement | undefined | null;

  constructor() {
    game.once('ready', () => {
      this.#gameCanvas = document.getElementById('canvas') as HTMLCanvasElement | null;
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

  /**
   * button: 0 = left, 1 = middle, 2 = right
   */
  mouseDown(button: 0 | 1 | 2): void {
    const mouseDown = new MouseEvent('mousedown', {
      button: button,
      cancelable: true,
      composed: true,
      bubbles: true,
    });

    _window.dispatchEvent(mouseDown);
  }

  /**
   * button: 0 = left, 1 = middle, 2 = right
   */
  mouseUp(button: 0 | 1 | 2): void {
    const mouseUp = new MouseEvent('mouseup', {
      button: button,
      cancelable: true,
      composed: true,
      bubbles: true,
    });

    _window.dispatchEvent(mouseUp);
  }

  /**
   * button: 0 = left, 1 = middle, 2 = right
   */
  async mousePress(button: 0 | 1 | 2): Promise<void> {
    this.mouseDown(button);
    await sleep(200);
    this.mouseUp(button);
    await sleep(10);
  }

  #toKeyCode(key: string): number {
    if (key.length != 1) {
      throw new Error(`diepAPI: Unsupported key: ${key}`);
    }

    return key.toUpperCase().charCodeAt(0);
  }
}

export const input = new Input();
