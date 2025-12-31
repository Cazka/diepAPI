import { wasmInstance } from './wasm-instance';

class WasmMemory {
  #memory: WebAssembly.Memory | null = null;

  get memory(): WebAssembly.Memory | null {
    return this.#memory;
  }

  constructor() {
    wasmInstance.on('instantiated', () => {
      const memoryDescriptor = wasmInstance.exportDescriptors?.find(
        (desc) => desc.kind === 'memory',
      );
      if (!memoryDescriptor) {
        throw new Error('diepAPI: No memory descriptor found in WASM module exports');
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.#memory = wasmInstance.exports![memoryDescriptor.name] as WebAssembly.Memory;
    });
  }
}

export const wasmMemory = new WasmMemory();
