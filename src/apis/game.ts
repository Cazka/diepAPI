import { CanvasKit } from '../core/canvas_kit';
import { EventEmitter } from '../core/event_emitter';

/**
 * Events:
 * - `frame`: Emitted every frame. Can be used for things that should be executed on every frame
 * - `frame_end`: Emitted after `frame` and is mainly used internally to update position variables
 * - `state => (state)`: Emitted whenever the game changes its state: 'home', 'game', 'stats', 'loading', 'captcha
 * - `s_home`: Emitted when the game changes its state to home
 * - `s_game`: Emitted when the game changes its state to game
 * - `s_stats`: Emitted when the game changes its state to stats
 * - `s_loading`: Emitted when the game changes its state to loading
 * - `s_captcha`: Emitted when the game changes its state to captcha
 */
class Game extends EventEmitter {
    #ready = false;
    #shadowRoot: ShadowRoot;

    constructor() {
        super();

        CanvasKit.hookRAF(() => this.#onframe());
    }

    #onframe(): void {
        if (!this.#ready && _window.input !== undefined) {
            this.#ready = true;
            this.#onready();
        }

        super.emit('frame');
        super.emit('frame_end');
    }

    #onready(): void {
        setTimeout(() => super.emit('ready'), 100);

        this.#shadowRoot = document.querySelector('d-base').shadowRoot;
        new MutationObserver((mutationList, observer) => {
            mutationList.forEach((mutation) => {
                if (mutation.addedNodes.length === 0) {
                    return;
                }

                super.emit('state', this.state);
                super.emit(`s_${this.state}`);
                return;
            });
        }).observe(this.#shadowRoot, { childList: true });
    }

    get state(): string {
        return this.#shadowRoot.querySelector('.screen').tagName.slice(2).toLowerCase();
    }

    get inHome(): boolean {
        return this.state === 'home';
    }

    get inGame(): boolean {
        return this.state === 'game';
    }

    get inStats(): boolean {
        return this.state === 'stats';
    }

    get inLoading(): boolean {
        return this.state === 'loading';
    }

    get isCaptcha(): boolean {
        return this.state === 'captcha';
    }
}

export const game = new Game();
