import { EventEmitter } from '../core';
import { assert } from '../utils/assert';
import { wasmInstance } from './wasm-instance';

export type MemoryAccessEvents = 'instantiated';

class MemoryAccess extends EventEmitter<MemoryAccessEvents> {
  #buffer: ArrayBuffer | null = null;
  #HEAP8: Int8Array | null = null;
  #HEAP16: Int16Array | null = null;
  #HEAP32: Int32Array | null = null;
  #HEAPU8: Uint8Array | null = null;
  #HEAPU16: Uint16Array | null = null;
  #HEAPU32: Uint32Array | null = null;
  #HEAPF32: Float32Array | null = null;
  #HEAPF64: Float64Array | null = null;

  get buffer(): ArrayBuffer | null {
    return this.#buffer;
  }
  get HEAP8(): Int8Array | null {
    return this.#HEAP8;
  }
  get HEAP16(): Int16Array | null {
    return this.#HEAP16;
  }
  get HEAP32(): Int32Array | null {
    return this.#HEAP32;
  }
  get HEAPU8(): Uint8Array | null {
    return this.#HEAPU8;
  }
  get HEAPU16(): Uint16Array | null {
    return this.#HEAPU16;
  }
  get HEAPU32(): Uint32Array | null {
    return this.#HEAPU32;
  }
  get HEAPF32(): Float32Array | null {
    return this.#HEAPF32;
  }
  get HEAPF64(): Float64Array | null {
    return this.#HEAPF64;
  }

  constructor() {
    super();
    wasmInstance.on('instantiated', () => {
      assert(wasmInstance.memory !== null, 'MemoryAccess: WASM memory is null upon instantiation');

      this.#buffer = wasmInstance.memory.buffer;
      this.#HEAP8 = new Int8Array(this.#buffer);
      this.#HEAP16 = new Int16Array(this.#buffer);
      this.#HEAP32 = new Int32Array(this.#buffer);
      this.#HEAPU8 = new Uint8Array(this.#buffer);
      this.#HEAPU16 = new Uint16Array(this.#buffer);
      this.#HEAPU32 = new Uint32Array(this.#buffer);
      this.#HEAPF32 = new Float32Array(this.#buffer);
      this.#HEAPF64 = new Float64Array(this.#buffer);

      super.emit('instantiated');
    });
  }
}

export const memoryAccess = new MemoryAccess();
