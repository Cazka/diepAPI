import { EventEmitter } from './event_emitter';
import { CanvasKit } from './canvas_kit';
import { UserConsole } from './user_console';

class Game extends EventEmitter {
    #ready = false;
    public console: UserConsole;
    constructor() {
        super();

        CanvasKit.hookRAF(() => this.#onframe());
        
        this.console = new UserConsole({ game: this });
        this.console.log("API loaded");
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

export type { Game };
export const game = new Game();
