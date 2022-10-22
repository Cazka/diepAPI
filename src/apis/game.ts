import { CanvasKit } from '../core/canvas_kit';
import { EventEmitter } from '../core/event_emitter';

/**
 * Events:
 * - frame: Emitted every frame. Can be used for things that should be executed on every frame
 * - frame_end: Emitted after `frame` and is mainly used internally to update position variables
 */
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
        super.emit('frame_end');
    }

    #onready(): void {
        setTimeout(() => super.emit('ready'), 100);
    }
}

export const game = new Game();
