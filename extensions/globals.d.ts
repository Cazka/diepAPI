interface Input {
    mouse: (x: number, y: number) => void;
    keyDown: (key: string | number) => void;
    keyUp: (key: string | number) => void;
    blur: () => void;
    wheel: Function;
    prevent_right_click: (value: boolean) => void;
    flushInputHooks: Function;
    set_convar: (key: string, value: string) => boolean;
    get_convar: (key: string) => null | string;
    execute: (v: string) => void;
    print_convar_help: () => void;
    should_prevent_unload: () => boolean;
}

declare var input: Input;

declare var unsafeWindow: Window & typeof globalThis;
declare var _window: Window & typeof globalThis;
