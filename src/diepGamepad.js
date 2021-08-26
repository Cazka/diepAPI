export default class DiepGamepad {
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
        this._axes = [0, 0, 0, 0];
        this._buttons = [...Array(17)].map((x) => {
            return { pressed: false };
        });
        this._connected = false;

        window.navigator.getGamepads = () => [this._connected ? this.toGamepad() : undefined];
    }

    set x(value) {
        this._axes[0] = value;
    }
    set y(value) {
        this._axes[1] = value;
    }
    set mx(value) {
        this._axes[2] = value;
    }
    set my(value) {
        this._axes[3] = value;
    }
    set leftMouse(value) {
        this._buttons[7].pressed = value;
    }
    set rightMouse(value) {
        this._buttons[6].pressed = value;
    }
    set connected(value) {
        this._connected = value;
    }

    get x() {
        return this._axes[0];
    }
    get y() {
        return this._axes[1];
    }
    get mx() {
        return this._axes[2];
    }
    get my() {
        return this._axes[3];
    }
    get leftMouse() {
        return this._buttons[7].pressed;
    }
    get rightMouse() {
        return this._buttons[6].pressed;
    }
    get connected() {
        return this._connected;
    }

    toGamepad() {
        return {
            axes: this._axes,
            buttons: this._buttons,
            mapping: 'standard',
        };
    }
}
