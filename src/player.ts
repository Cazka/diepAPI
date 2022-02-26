import { Vector } from './vector';
import { EventEmitter } from './event_emitter';
import { game } from './game';
import { arenaScaling } from './arena_scaling';
import { playerMovement } from './player_movement';
import { gamepad } from './diep_gamepad';
import { CanvasKit } from './canvas_kit';

const sleep = (ms: number): Promise<void> => new Promise((resolve, reject) => setTimeout(resolve, ms));

class Player extends EventEmitter {
    #isDead = true;
    #mouseLock = false;
    #mouseScreenPos = new Vector(0, 0);
    #mousePos = new Vector(0, 0);
    #gamemode = window.localStorage.gamemode;
    #level = 1;
    #tank = 'Tank';

    constructor() {
        super();

        game.once('ready', () => {
            //Check dead or alive
            game.on('frame', () => {
                const isDead = !window.input.should_prevent_unload();
                if (this.#isDead == isDead) return;
                this.#isDead = isDead;

                if (this.#isDead) this.#ondead();
                else this.#onspawn();
            });
            //update mouse position
            game.on('frame', () => {
                this.#mousePos = arenaScaling.toArenaPos(arenaScaling.screenToCanvas(this.#mouseScreenPos));
            });

            //Mouse events
            const canvas = document.getElementById('canvas');
            canvas.onmousemove = new Proxy(canvas.onmousemove, {
                apply: (target, thisArg, args) => {
                    if (this.#mouseLock) return;
                    this.#onmousemove(args[0]);
                    return Reflect.apply(target, thisArg, args);
                },
            });
            canvas.onmousedown = new Proxy(canvas.onmousedown, {
                apply: (target, thisArg, args) => {
                    if (this.#mouseLock) return;
                    this.#onmousedown(args[0]);
                    return Reflect.apply(target, thisArg, args);
                },
            });
            canvas.onmouseup = new Proxy(canvas.onmouseup, {
                apply: (target, thisArg, args) => {
                    if (this.#mouseLock) return;
                    this.#onmouseup(args[0]);
                    return Reflect.apply(target, thisArg, args);
                },
            });
            //Key events
            window.onkeydown = new Proxy(window.onkeydown, {
                apply: (target, thisArg, args) => {
                    this.#onkeydown(args[0]);
                    return Reflect.apply(target, thisArg, args);
                },
            });
            window.onkeyup = new Proxy(window.onkeyup, {
                apply: (target, thisArg, args) => {
                    this.#onkeyup(args[0]);
                    return Reflect.apply(target, thisArg, args);
                },
            });

            // tank and level event listener
            CanvasKit.hook('fillText', (target, thisArg, args) => {
                const text = args[0];
                const match = text.match(/^Lvl (\d+) (\w*)$/);
                if (match == null) {
                    return;
                }

                const newLevel = Number(match[1]);
                const newTank = match[2];

                // make sure to trigger events for all levels in between.
                while (newLevel > this.#level + 1) {
                    super.emit('level', ++this.#level);
                }

                if (newLevel !== this.#level) super.emit('level', newLevel);
                if (newTank !== this.#tank) super.emit('tank', newTank);

                this.#level = newLevel;
                this.#tank = match[2];
            });
        });
    }

    get position(): Vector {
        return playerMovement.position;
    }

    get velocity(): Vector {
        return playerMovement.velocity;
    }

    get mouse(): Vector {
        return this.#mousePos;
    }

    get isDead(): boolean {
        return this.#isDead;
    }

    get gamemode(): string {
        return this.#gamemode;
    }

    get level(): number {
        return this.#level;
    }

    get tank(): string {
        return this.#tank;
    }

    /**
     * Predict where this object will be after `time`
     * @param time The time in ms
     */
    predictPos(time: number): Vector {
        return playerMovement.predictPos(time);
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
        this.#gamemode = window.localStorage.gamemode;

        await sleep(50);
        super.emit('spawn');
    }

    useGamepad(value: boolean): void {
        gamepad.connected = value;
    }

    keyDown(key: number | string): void {
        if (typeof key == 'string') {
            if (key.length != 1) throw new Error(`diepAPI: Unsupported key: ${key}`);
            key = key.toUpperCase().charCodeAt(0);
        }
        window.input.keyDown(key);
        this.#onkeydown({ keyCode: key } as KeyboardEvent);
    }
    keyUp(key: number | string): void {
        if (typeof key == 'string') {
            if (key.length != 1) throw new Error(`diepAPI: Unsupported key: ${key}`);
            key = key.toUpperCase().charCodeAt(0);
        }
        window.input.keyUp(key);
        this.#onkeyup({ keyCode: key } as KeyboardEvent);
    }
    async keyPress(key: number | string): Promise<void> {
        this.keyDown(key);
        await sleep(200);
        this.keyUp(key);
        await sleep(10);
    }

    async spawn(name: string, attempts: number = 0): Promise<void> {
        if (!this.#isDead) return;

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
        const x = arenaScaling.screenToCanvasUnits(arenaScaling.windowRatio * (x_index * 115 + 97.5));
        const y = arenaScaling.screenToCanvasUnits(arenaScaling.windowRatio * (y_index * 110 + 120));

        this.#mouseLock = true;
        window.input.mouse(x, y);
        await this.keyPress(1);
        // wait 200 ms before disabling mouselock
        await sleep(200);
        this.#mouseLock = false;
        // wait 1500 ms for the animation to finish
        await sleep(1500);
    }

    moveTo(arenaPos: Vector): void {
        if (gamepad.connected) {
            const direction = Vector.subtract(arenaPos, this.position);
            const distance = Vector.len(direction);

            if (distance === 0) {
                gamepad.x = 0;
                gamepad.y = 0;
                return;
            }

            //max speed
            const velocity = Vector.scale(1 / distance, direction);

            gamepad.x = velocity.x;
            gamepad.y = velocity.y;
        } else {
            const direction = Vector.subtract(arenaPos, this.position);

            if (direction.x > 0) {
                this.keyUp('a');
                this.keyDown('d');
            } else if (direction.x < 0) {
                this.keyUp('d');
                this.keyDown('a');
            } else {
                this.keyUp('a');
                this.keyUp('d');
            }

            if (direction.y > 0) {
                this.keyUp('w');
                this.keyDown('s');
            } else if (direction.y < 0) {
                this.keyUp('s');
                this.keyDown('w');
            } else {
                this.keyUp('w');
                this.keyUp('s');
            }
        }
    }

    lookAt(arenaPos: Vector): void {
        const position = arenaScaling.toCanvasPos(arenaPos);
        window.input.mouse(position.x, position.y);

        this.#onmousemove({ clientX: position.x, clientY: position.y } as MouseEvent);
    }

    #onmousemove(e: MouseEvent): void {
        this.#mouseScreenPos = new Vector(e.clientX, e.clientY);

        if (gamepad.connected) {
            const arenaPos = arenaScaling.toArenaPos(arenaScaling.screenToCanvas(this.#mouseScreenPos));
            const direction = Vector.subtract(arenaPos, this.position);
            let axes = Vector.scale(arenaScaling.fov / 1200 / 1.1, direction);

            const length = Vector.len(axes);

            if (length !== 0 && length < 0.15) {
                axes = Vector.scale(0.15 / length, axes);
            }

            gamepad.mx = axes.x;
            gamepad.my = axes.y;
        }
    }

    #onmousedown(e: MouseEvent): void {
        if (gamepad.connected) this.#onkeydown({ keyCode: e.which } as KeyboardEvent);
    }

    #onmouseup(e: MouseEvent): void {
        if (gamepad.connected) this.#onkeyup({ keyCode: e.which } as KeyboardEvent);
    }

    #onkeydown(e: KeyboardEvent): void {
        super.emit('keydown', e.keyCode);

        if (gamepad.connected) {
            switch (e.keyCode) {
                case 37:
                case 65:
                    gamepad.x = -1;
                    break;
                case 40:
                case 83:
                    gamepad.y = 1;
                    break;
                case 38:
                case 87:
                    gamepad.y = -1;
                    break;
                case 39:
                case 68:
                    gamepad.x = 1;
                    break;
                case 1:
                case 32:
                    gamepad.leftMouse = true;
                    break;
                case 3:
                case 16:
                    gamepad.rightMouse = true;
                    break;
            }
        }
    }

    #onkeyup(e: KeyboardEvent): void {
        super.emit('keyup', e.keyCode);

        if (gamepad.connected) {
            switch (e.keyCode) {
                case 37:
                case 65:
                    gamepad.x = 0;
                    break;
                case 40:
                case 83:
                    gamepad.y = 0;
                    break;
                case 38:
                case 87:
                    gamepad.y = 0;
                    break;
                case 39:
                case 68:
                    gamepad.x = 0;
                    break;
                case 1:
                case 32:
                    gamepad.leftMouse = false;
                    break;
                case 3:
                case 16:
                    gamepad.rightMouse = false;
                    break;
            }
        }
    }
}

export const player = new Player();
