import { Vector } from './vector';
import { EventEmitter } from './event_emitter';
import { game } from './game';
import { arenaScaling } from './arena_scaling';
import { playerMovement } from './player_movement';

const sleep = (ms: number): Promise<void> => new Promise((resolve, reject) => setTimeout(resolve, ms));

class Player extends EventEmitter {
    #dead = true;
    #mouseLock = false;

    constructor() {
        super();

        game.once('ready', () => {
            game.on('frame', () => {
                const dead = !window.input.should_prevent_unload();
                if (this.#dead == dead) return;
                this.#dead = dead;

                if (this.#dead) this.#ondead();
                else this.#onspawn();
            });

            //Mouse events
            const canvas = document.getElementById('canvas');
            canvas.onmousemove = new Proxy(canvas.onmousemove, {
                apply: (target, thisArg, args) => {
                    if (this.#mouseLock) return;
                    //this._onmousemove(args[0]);
                    Reflect.apply(target, thisArg, args);
                },
            });
            canvas.onmousedown = new Proxy(canvas.onmousedown, {
                apply: (target, thisArg, args) => {
                    if (this.#mouseLock) return;
                    //this._onmousedown(args[0]);
                    Reflect.apply(target, thisArg, args);
                },
            });
            canvas.onmouseup = new Proxy(canvas.onmouseup, {
                apply: (target, thisArg, args) => {
                    if (this.#mouseLock) return;
                    //this._onmouseup(args[0]);
                    Reflect.apply(target, thisArg, args);
                },
            });
            //Key events
            window.onkeydown = new Proxy(window.onkeydown, {
                apply: (target, thisArg, args) => {
                    //this._onkeydown(args[0]);
                    return Reflect.apply(target, thisArg, args);
                },
            });
            window.onkeyup = new Proxy(window.onkeyup, {
                apply: (target, thisArg, args) => {
                    //this._onkeyup(args[0]);
                    return Reflect.apply(target, thisArg, args);
                },
            });
        });
    }

    get position(): Vector {
        return playerMovement.position;
    }

    get velocity(): Vector {
        return playerMovement.velocity;
    }

    /**
     * Fun function to upgrade to octo
     * @async
     */
    async octoBuild() {
        this.keyDown('k');
        await this.upgrade_stat(4, 7);
        await this.upgrade_stat(5, 7);
        await this.upgrade_stat(6, 7);
        await this.upgrade_stat(7, 7);
        await this.upgrade_stat(8, 5);
        await this.upgrade_tank(1);
        await this.upgrade_tank(2);
        await this.upgrade_tank(1);
        this.keyUp('k');
    }

    async #ondead(): Promise<void> {
        await sleep(50);
        super.emit('dead');
    }

    async #onspawn(): Promise<void> {
        await sleep(50);
        super.emit('spawn');
    }

    keyDown(key: number | string): void {
        if (typeof key == 'string') {
            if (key.length != 1) throw new Error(`diepAPI: Unsupported key: ${key}`);
            key = key.toUpperCase().charCodeAt(0);
        }
        window.input.keyDown(key);
        //this._onkeydown({ keyCode: key });
    }
    keyUp(key: number | string): void {
        if (typeof key == 'string') {
            if (key.length != 1) throw new Error(`diepAPI: Unsupported key: ${key}`);
            key = key.toUpperCase().charCodeAt(0);
        }
        window.input.keyUp(key);
        //this._onkeyup({ keyCode: key });
    }
    async keyPress(key: number | string): Promise<void> {
        this.keyDown(key);
        await sleep(200);
        this.keyUp(key);
        await sleep(10);
    }

    async spawn(name: string, attempts: number = 0): Promise<void> {
        if (!this.#dead) return;

        if (name !== undefined) (document.getElementById('textInput') as HTMLInputElement).value = name;

        await this.keyPress(13);

        await sleep(250);

        await this.spawn(name, attempts + 1);
    }

    async upgrade_stat(id: number, level: number): Promise<void> {
        if (id < 1 || id > 8) throw `diepAPI: ${id} is not a supported stat`;

        this.keyDown(85);
        for (let i = 0; i < level; i++) {
            await this.keyPress(48 + id);
        }
        this.keyUp(85);
        await sleep(250);
    }

    async upgrade_tank(index: number): Promise<void> {
        index -= 1;
        const x_index = index % 2;
        const y_index = Math.floor(index / 2);
        const x = window.devicePixelRatio * arenaScaling.windowRatio * (x_index * 115 + 97.5);
        const y = window.devicePixelRatio * arenaScaling.windowRatio * (y_index * 110 + 120);

        this.#mouseLock = true;
        window.input.mouse(x, y);
        await this.keyPress(1);
        // wait 200 ms before disabling mouselock
        await sleep(200);
        this.#mouseLock = false;
        // wait 1500 ms for the animation to finish
        await sleep(1500);
    }
}

export const player = new Player();
