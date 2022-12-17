interface Input {
    blur: () => void;
    execute: (v: string) => void;
    get_convar: (key: string) => null | string;
    keyDown: (key: string | number) => void;
    keyUp: (key: string | number) => void;
    mouse: (x: number, y: number) => void;
    set_convar: (key: string, value: string) => boolean;
    should_prevent_unload: () => boolean;
    trySpawn: (username: string) => void;
}

declare var input: Input;

declare var unsafeWindow: Window & typeof globalThis;
declare var _window: Window & typeof globalThis;
