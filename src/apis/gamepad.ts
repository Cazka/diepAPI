class Gamepad {
  #axes: number[];
  #buttons: { pressed: boolean }[];
  connected: boolean;

  /**
   * Emulates a Gampad
   * when `gamepad.connected` is set to `true` the game will
   * ignore following keyboard inputs:
   * 		W, A, S, D, upArrow, leftArrow, downArrow, rightArray
   *      leftMouse, rightMouse, Spacebar, Shift,
   *      MouseMovement to change tank angle
   * these are also the only keys we emulate with this gamepad
   *
   */
  constructor() {
    this.#axes = [0, 0, 0, 0];
    this.#buttons = Array.from({ length: 17 }, () => ({ pressed: false }));
    this.connected = false;

    // eslint-disable-next-line @typescript-eslint/unbound-method
    _window.navigator.getGamepads = new Proxy(_window.navigator.getGamepads, {
      apply: (target, thisArg, args) => {
        if (this.connected) return [this.#toGamepad()];
        return Reflect.apply(target, thisArg, args);
      },
    });
  }

  set x(value: number) {
    this.#axes[0] = value;
  }
  get x(): number {
    return this.#axes[0];
  }

  set y(value: number) {
    this.#axes[1] = value;
  }
  get y(): number {
    return this.#axes[1];
  }

  set mx(value: number) {
    this.#axes[2] = value;
  }
  get mx(): number {
    return this.#axes[2];
  }

  set my(value: number) {
    this.#axes[3] = value;
  }
  get my(): number {
    return this.#axes[3];
  }

  set leftMouse(value: boolean) {
    this.#buttons[7].pressed = value;
  }
  get leftMouse(): boolean {
    return this.#buttons[7].pressed;
  }

  set rightMouse(value: boolean) {
    this.#buttons[6].pressed = value;
  }
  get rightMouse(): boolean {
    return this.#buttons[6].pressed;
  }

  #toGamepad(): Gamepad {
    return {
      axes: this.#axes,
      buttons: this.#buttons,
      mapping: 'standard',
    } as unknown as Gamepad;
  }
}

export const gamepad = new Gamepad();
