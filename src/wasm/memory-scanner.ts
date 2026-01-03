import { assert } from '../utils/assert';
import { memoryAccess } from './memory-access';

const DATA_TYPE_SIZES = {
  int8: 1,
  int16: 2,
  int32: 4,
  uint8: 1,
  uint16: 2,
  uint32: 4,
  float32: 4,
  float64: 8,
} as const satisfies Record<MemoryDataType, number>;

export type MemoryDataType =
  | 'int8'
  | 'int16'
  | 'int32'
  | 'uint8'
  | 'uint16'
  | 'uint32'
  | 'float32'
  | 'float64';

class MemoryAddress {
  #address: number;

  constructor(address: number) {
    this.#address = address;
  }

  get int8(): number {
    assert(memoryAccess.HEAP8 !== null, 'diepAPI: HEAP8 is null');
    return memoryAccess.HEAP8[this.#address];
  }
  set int8(value: number) {
    assert(memoryAccess.HEAP8 !== null, 'diepAPI: HEAP8 is null');
    memoryAccess.HEAP8[this.#address] = value;
  }
  get int16(): number {
    assert(memoryAccess.HEAP16 !== null, 'diepAPI: HEAP16 is null');
    return memoryAccess.HEAP16[this.#address >> 1];
  }
  set int16(value: number) {
    assert(memoryAccess.HEAP16 !== null, 'diepAPI: HEAP16 is null');
    memoryAccess.HEAP16[this.#address >> 1] = value;
  }
  get int32(): number {
    assert(memoryAccess.HEAP32 !== null, 'diepAPI: HEAP32 is null');
    return memoryAccess.HEAP32[this.#address >> 2];
  }
  set int32(value: number) {
    assert(memoryAccess.HEAP32 !== null, 'diepAPI: HEAP32 is null');
    memoryAccess.HEAP32[this.#address >> 2] = value;
  }
  get uint8(): number {
    assert(memoryAccess.HEAPU8 !== null, 'diepAPI: HEAPU8 is null');
    return memoryAccess.HEAPU8[this.#address];
  }
  set uint8(value: number) {
    assert(memoryAccess.HEAPU8 !== null, 'diepAPI: HEAPU8 is null');
    memoryAccess.HEAPU8[this.#address] = value;
  }
  get uint16(): number {
    assert(memoryAccess.HEAPU16 !== null, 'diepAPI: HEAPU16 is null');
    return memoryAccess.HEAPU16[this.#address >> 1];
  }
  set uint16(value: number) {
    assert(memoryAccess.HEAPU16 !== null, 'diepAPI: HEAPU16 is null');
    memoryAccess.HEAPU16[this.#address >> 1] = value;
  }
  get uint32(): number {
    assert(memoryAccess.HEAPU32 !== null, 'diepAPI: HEAPU32 is null');
    return memoryAccess.HEAPU32[this.#address >> 2];
  }
  set uint32(value: number) {
    assert(memoryAccess.HEAPU32 !== null, 'diepAPI: HEAPU32 is null');
    memoryAccess.HEAPU32[this.#address >> 2] = value;
  }
  get float32(): number {
    assert(memoryAccess.HEAPF32 !== null, 'diepAPI: HEAPF32 is null');
    return memoryAccess.HEAPF32[this.#address >> 2];
  }
  set float32(value: number) {
    assert(memoryAccess.HEAPF32 !== null, 'diepAPI: HEAPF32 is null');
    memoryAccess.HEAPF32[this.#address >> 2] = value;
  }
  get float64(): number {
    assert(memoryAccess.HEAPF64 !== null, 'diepAPI: HEAPF64 is null');
    return memoryAccess.HEAPF64[this.#address >> 3];
  }
  set float64(value: number) {
    assert(memoryAccess.HEAPF64 !== null, 'diepAPI: HEAPF64 is null');
    memoryAccess.HEAPF64[this.#address >> 3] = value;
  }
}

class ScanAddress extends MemoryAddress {
  #type: MemoryDataType;
  #oldValue: number;

  get oldValue(): number {
    return this.#oldValue;
  }

  constructor(address: number, type: MemoryDataType) {
    super(address);
    this.#type = type;
    this.#oldValue = this.current;
  }

  get current(): number {
    return this[this.#type];
  }

  update() {
    this.#oldValue = this.current;
  }
}

class ScanSession {
  readonly predicates = {
    unchanged: (current: number, old: number) => current === old,
    changed: (current: number, old: number) => current !== old,
    equalTo: (value: number) => (current: number, old: number) => current === value,
    inRange: (min: number, max: number) => (current: number, old: number) =>
      current >= min && current <= max,
    increased: (current: number, old: number) => current > old,
    decreased: (current: number, old: number) => current < old,
  } as const;

  #values: ScanAddress[] = [];

  constructor(type: MemoryDataType) {
    this.#values = [];

    assert(memoryAccess.buffer !== null, 'diepAPI: Memory buffer is null');

    for (let addr = 0; addr < memoryAccess.buffer.byteLength; addr += DATA_TYPE_SIZES[type]) {
      this.#values.push(new ScanAddress(addr, type));
    }
  }

  get results(): ScanAddress[] {
    return this.#values;
  }

  scan(predicate: (current: number, old: number) => boolean): this {
    this.#values = this.#values.filter((value) => predicate(value.current, value.oldValue));
    this.#values.forEach((value) => {
      value.update();
    });

    return this;
  }

  changed(): this {
    return this.scan(this.predicates.changed);
  }
  unchanged(): this {
    return this.scan(this.predicates.unchanged);
  }
  equalTo(value: number): this {
    return this.scan(this.predicates.equalTo(value));
  }
  inRange(min: number, max: number): this {
    return this.scan(this.predicates.inRange(min, max));
  }
  increased(): this {
    return this.scan(this.predicates.increased);
  }
  decreased(): this {
    return this.scan(this.predicates.decreased);
  }
}

class MemoryScanner {
  createSession(type: MemoryDataType): ScanSession {
    assert(memoryAccess.buffer !== null, 'diepAPI: Memory buffer is null');
    return new ScanSession(type);
  }
}

export const memoryScanner = new MemoryScanner();
