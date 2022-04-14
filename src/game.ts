import { CanvasKit } from './canvas_kit';
import { EventEmitter } from './event_emitter';

class Game extends EventEmitter {
    #ready = false;

    constructor() {
        super();

        CanvasKit.hookRAF(() => this.#onframe());
    }

    #onframe(): void {
        if (!this.#ready && window.input !== undefined) {
            this.#ready = true;
            this.#onready();
        }

        super.emit('frame');
    }

    #onready(): void {
        setTimeout(() => super.emit('ready'), 100);
    }
}

export const game = new Game();
