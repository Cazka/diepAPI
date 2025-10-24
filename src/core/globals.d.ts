interface Input {
  execute: (v: string) => void;
  get_convar: (key: string) => null | string;
  set_convar: (key: string, value: string) => boolean;
}

declare var input: Input;

declare var unsafeWindow: Window & typeof globalThis;
declare var _window: Window & typeof globalThis;
