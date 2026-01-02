import { EventEmitter } from '../core';

export type WasmInstanceEvents = 'instantiated';

/**
 * Events:
 * - instantiated: Emitted when the wasm instance is instantiated
 */
class WasmInstance extends EventEmitter<WasmInstanceEvents> {
  #instance: WebAssembly.Instance | null = null;
  #module: WebAssembly.Module | null = null;
  #importDescriptors: WebAssembly.ModuleImportDescriptor[] | null = null;
  #exportDescriptors: WebAssembly.ModuleExportDescriptor[] | null = null;
  #imports: WebAssembly.Imports | null = null;
  #exports: WebAssembly.Exports | null = null;
  #memory: WebAssembly.Memory | null = null;

  get instance(): WebAssembly.Instance | null {
    return this.#instance;
  }

  get module(): WebAssembly.Module | null {
    return this.#module;
  }

  get importDescriptors(): WebAssembly.ModuleImportDescriptor[] | null {
    return this.#importDescriptors;
  }
  get exportDescriptors(): WebAssembly.ModuleExportDescriptor[] | null {
    return this.#exportDescriptors;
  }

  get imports(): WebAssembly.Imports | null {
    return this.#imports;
  }

  get exports(): WebAssembly.Exports | null {
    return this.#exports;
  }

  get memory(): WebAssembly.Memory | null {
    return this.#memory;
  }

  constructor() {
    super();
    WebAssembly.instantiateStreaming = new Proxy(WebAssembly.instantiateStreaming, {
      apply: async (
        target,
        thisArg,
        args: [Response | PromiseLike<Response>, WebAssembly.Imports | undefined],
      ) => {
        const [source, importObject] = args;

        const result = await Reflect.apply(target, thisArg, args);

        this.#instance = result.instance;
        this.#module = result.module;

        this.#importDescriptors = WebAssembly.Module.imports(this.#module);
        this.#exportDescriptors = WebAssembly.Module.exports(this.#module);

        this.#imports = importObject ?? null;
        this.#exports = result.instance.exports;

        const memoryDescriptor = wasmInstance.exportDescriptors?.find(
          (desc) => desc.kind === 'memory',
        );
        if (!memoryDescriptor) {
          throw new Error('diepAPI: No memory descriptor found in WASM module exports');
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.#memory = wasmInstance.exports![memoryDescriptor.name] as WebAssembly.Memory;

        this.emit('instantiated');

        return result;
      },
    });
  }
}

export const wasmInstance = new WasmInstance();
