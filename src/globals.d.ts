interface Input {
    mouse: (x: number, y: number) => void;
    keyDown: (key: string | number) => void;
    keyUp: (key: string | number) => void;
    blur: Function; //_reset_keys
    wheel: Function; //_mouse_wheel
    prevent_right_click: (value: boolean) => void; //_prevent_right_click
    flushInputHooks: Function; //_flush_input_hooks
    set_convar: (key: string, value: string) => boolean;
    get_convar: (key: string) => null | string;
    execute: (v: string) => void;
    print_convar_help: () => void;
    should_prevent_unload: () => boolean;
}

declare var input: Input;
