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
        this.#buttons = [...Array(17)].map((x) => {
            return { pressed: false };
        });
        this.connected = false;

        window.navigator.getGamepads = new Proxy(window.navigator.getGamepads, {
            apply: (target, thisArg, args) => {
                if (this.connected) return [this.#toGamepad()];
                return Reflect.apply(target, thisArg, args);
            },
        });
    }

    set x(value: number) {
        this.#axes[0] = value;
    }
    set y(value: number) {
        this.#axes[1] = value;
    }
    set mx(value: number) {
        this.#axes[2] = value;
    }
    set my(value: number) {
        this.#axes[3] = value;
    }
    set leftMouse(value: boolean) {
        this.#buttons[7].pressed = value;
    }
    set rightMouse(value: boolean) {
        this.#buttons[6].pressed = value;
    }

    get x(): number {
        return this.#axes[0];
    }
    get y(): number {
        return this.#axes[1];
    }
    get mx(): number {
        return this.#axes[2];
    }
    get my(): number {
        return this.#axes[3];
    }
    get leftMouse(): boolean {
        return this.#buttons[7].pressed;
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
