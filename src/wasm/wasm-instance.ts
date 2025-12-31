import { EventEmitter } from '../core';

export type WasmInstanceEvents = 'instantiated';

/**
 * Events:
 * - instantiated: Emitted when the wasm instance is instantiated
 */
class WasmInstance extends EventEmitter<WasmInstanceEvents> {
  #instance: WebAssembly.Instance | null = null;
  #module: WebAssembly.Module | null = null;
  #imports: WebAssembly.ModuleImportDescriptor[] | null = null;
  #exports: WebAssembly.ModuleExportDescriptor[] | null = null;

  get instance() {
    return this.#instance;
  }

  get module() {
    return this.#module;
  }

  get imports() {
    return this.#imports;
  }

  get exports() {
    return this.#exports;
  }

  constructor() {
    super();
    WebAssembly.instantiateStreaming = new Proxy(WebAssembly.instantiateStreaming, {
      apply: async (target, thisArg, args) => {
        const result = (await Reflect.apply(
          target,
          thisArg,
          args,
        )) as WebAssembly.WebAssemblyInstantiatedSource;

        this.#instance = result.instance;
        this.#module = result.module;

        this.#imports = WebAssembly.Module.imports(this.#module);
        this.#exports = WebAssembly.Module.exports(this.#module);

        this.emit('instantiated');

        return result;
      },
    });
  }
}

export const wasmInstance = new WasmInstance();
