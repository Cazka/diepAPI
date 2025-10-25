import { CanvasKit } from '../core/canvas_kit';
import { EventEmitter } from '../core/event_emitter';
import { Vector } from '../core/vector';
import { game } from './game';
import { gamepad } from './gamepad';
import { input } from './input';
import { playerMovement } from './player_movement';
import { scaling } from './scaling';

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve, reject) => setTimeout(resolve, ms));

class Player extends EventEmitter {
  #isDead = true;
  #mouseLock = false;
  #mouseCanvasPos = new Vector(0, 0);
  #mousePos = new Vector(0, 0);

  #username = (_window.localStorage.name as string | undefined) ?? '';
  #gamemode = (_window.localStorage.selected_gamemode as string | undefined) ?? '';
  #level = 1;
  #tank = 'Tank';

  constructor() {
    super();

    game.once('ready', () => {
      //Check dead or alive
      game.on('frame', () => {
        const isDead = document.getElementById('dimmer')?.dataset.isActive === 'true';
        if (this.#isDead == isDead) return;
        this.#isDead = isDead;

        if (this.#isDead) void this.#ondead();
        else void this.#onspawn();
      });
      //update mouse position
      game.on('frame', () => {
        this.#mousePos = scaling.toArenaPos(this.#mouseCanvasPos);
      });

      //Mouse events
      const canvas = document.getElementById('canvas');
      if (canvas == null) {
        throw new Error('diepAPI: Game canvas does not exist.');
      }

      canvas.onmousemove = new Proxy(
        canvas.onmousemove ??
          (() => {
            /* empty */
          }),
        {
          apply: (target, thisArg, args) => {
            if (this.#mouseLock) return;
            this.#onmousemove(args[0] as MouseEvent);
            return Reflect.apply(target, thisArg, args);
          },
        },
      );
      canvas.onmousedown = new Proxy(
        canvas.onmousedown ??
          (() => {
            /* empty */
          }),
        {
          apply: (target, thisArg, args) => {
            if (this.#mouseLock) return;
            this.#onmousedown(args[0] as MouseEvent);
            return Reflect.apply(target, thisArg, args);
          },
        },
      );
      canvas.onmouseup = new Proxy(
        canvas.onmouseup ??
          (() => {
            /* empty */
          }),
        {
          apply: (target, thisArg, args) => {
            if (this.#mouseLock) return;
            this.#onmouseup(args[0] as MouseEvent);
            return Reflect.apply(target, thisArg, args);
          },
        },
      );
      //Key events
      _window.onkeydown = new Proxy(
        _window.onkeydown ??
          (() => {
            /* empty */
          }),
        {
          apply: (target, thisArg, args) => {
            this.#onkeydown(args[0] as KeyboardEvent);
            return Reflect.apply(target, thisArg, args);
          },
        },
      );
      _window.onkeyup = new Proxy(
        _window.onkeyup ??
          (() => {
            /* empty */
          }),
        {
          apply: (target, thisArg, args) => {
            this.#onkeyup(args[0] as KeyboardEvent);
            return Reflect.apply(target, thisArg, args);
          },
        },
      );

      // tank and level event listener
      CanvasKit.hookCtx('fillText', (target, thisArg, args) => {
        const text = args[0];
        const match = /^Lvl (\d+) (.+)$/.exec(text);

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

  async #ondead(): Promise<void> {
    await sleep(50);
    super.emit('dead');
  }

  async #onspawn(): Promise<void> {
    this.#gamemode = (_window.localStorage.selected_gamemode as string | undefined) ?? '';
    this.#username = (_window.localStorage.player_name as string | undefined) ?? '';
    await sleep(50);
    super.emit('spawn');
  }

  useGamepad(value: boolean): void {
    gamepad.connected = value;
  }

  async spawn(name: string = this.#username): Promise<void> {
    await Promise.resolve();

    if (!this.#isDead) {
      return;
    }

    const spawnNameInput = document.getElementById('spawn-nickname') as HTMLInputElement;

    spawnNameInput.select();
    document.execCommand('insertText', false, name);

    document.getElementById('spawn-button')?.click();
  }

  async upgrade_stat(id: number, level: number): Promise<void> {
    if (id < 1 || id > 8) throw new Error(`diepAPI: ${id} is not a supported stat`);

    input.keyDown(85);
    for (let i = 0; i < level; i++) {
      await input.keyPress(48 + id);
    }
    input.keyUp(85);
    await sleep(250);
  }

  async upgrade_tank(index: number): Promise<void> {
    if (index < 1) throw new Error(`diepAPI: ${index} is not a supported tank index`);

    index -= 1;
    const x_index = index % 2;
    const y_index = Math.floor(index / 2);
    const x = scaling.screenToCanvasUnits(scaling.windowRatio * (x_index * 115 + 97.5));
    const y = scaling.screenToCanvasUnits(scaling.windowRatio * (y_index * 110 + 120));

    this.#mouseLock = true;
    input.mouse(x, y);
    await input.mousePress(0);
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
        input.keyUp('a');
        input.keyDown('d');
      } else if (direction.x < 0) {
        input.keyUp('d');
        input.keyDown('a');
      } else {
        input.keyUp('a');
        input.keyUp('d');
      }

      if (direction.y > 0) {
        input.keyUp('w');
        input.keyDown('s');
      } else if (direction.y < 0) {
        input.keyUp('s');
        input.keyDown('w');
      } else {
        input.keyUp('w');
        input.keyUp('s');
      }
    }
  }

  lookAt(arenaPos: Vector): void {
    const position = scaling.toCanvasPos(arenaPos);
    input.mouse(position.x, position.y);

    this.#onmousemove({ clientX: position.x, clientY: position.y } as MouseEvent);
  }

  #onmousemove(e: MouseEvent): void {
    this.#mouseCanvasPos = scaling.screenToCanvas(new Vector(e.clientX, e.clientY));

    if (gamepad.connected) {
      const arenaPos = scaling.toArenaPos(this.#mouseCanvasPos);
      const direction = Vector.subtract(arenaPos, this.position);
      let axes = Vector.scale(scaling.fov / 1200 / 1.1, direction);

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
