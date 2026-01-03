import { assert } from '../utils/assert';
import { memoryAccess } from './memory-access';

const DATA_TYPE_SIZES = {
  i8: 1,
  i16: 2,
  i32: 4,
  u8: 1,
  u16: 2,
  u32: 4,
  f32: 4,
  f64: 8,
} as const satisfies Record<MemoryDataType, number>;

export type MemoryDataType = 'i8' | 'i16' | 'i32' | 'u8' | 'u16' | 'u32' | 'f32' | 'f64';

class MemoryAddress {
  #address: number;

  constructor(address: number) {
    this.#address = address;
  }

  get i8(): number {
    assert(memoryAccess.HEAP8 !== null, 'diepAPI: HEAP8 is null');
    return memoryAccess.HEAP8[this.#address];
  }
  set i8(value: number) {
    assert(memoryAccess.HEAP8 !== null, 'diepAPI: HEAP8 is null');
    memoryAccess.HEAP8[this.#address] = value;
  }
  get i16(): number {
    assert(memoryAccess.HEAP16 !== null, 'diepAPI: HEAP16 is null');
    return memoryAccess.HEAP16[this.#address >> 1];
  }
  set i16(value: number) {
    assert(memoryAccess.HEAP16 !== null, 'diepAPI: HEAP16 is null');
    memoryAccess.HEAP16[this.#address >> 1] = value;
  }
  get i32(): number {
    assert(memoryAccess.HEAP32 !== null, 'diepAPI: HEAP32 is null');
    return memoryAccess.HEAP32[this.#address >> 2];
  }
  set i32(value: number) {
    assert(memoryAccess.HEAP32 !== null, 'diepAPI: HEAP32 is null');
    memoryAccess.HEAP32[this.#address >> 2] = value;
  }
  get u8(): number {
    assert(memoryAccess.HEAPU8 !== null, 'diepAPI: HEAPU8 is null');
    return memoryAccess.HEAPU8[this.#address];
  }
  set u8(value: number) {
    assert(memoryAccess.HEAPU8 !== null, 'diepAPI: HEAPU8 is null');
    memoryAccess.HEAPU8[this.#address] = value;
  }
  get u16(): number {
    assert(memoryAccess.HEAPU16 !== null, 'diepAPI: HEAPU16 is null');
    return memoryAccess.HEAPU16[this.#address >> 1];
  }
  set u16(value: number) {
    assert(memoryAccess.HEAPU16 !== null, 'diepAPI: HEAPU16 is null');
    memoryAccess.HEAPU16[this.#address >> 1] = value;
  }
  get u32(): number {
    assert(memoryAccess.HEAPU32 !== null, 'diepAPI: HEAPU32 is null');
    return memoryAccess.HEAPU32[this.#address >> 2];
  }
  set u32(value: number) {
    assert(memoryAccess.HEAPU32 !== null, 'diepAPI: HEAPU32 is null');
    memoryAccess.HEAPU32[this.#address >> 2] = value;
  }
  get f32(): number {
    assert(memoryAccess.HEAPF32 !== null, 'diepAPI: HEAPF32 is null');
    return memoryAccess.HEAPF32[this.#address >> 2];
  }
  set f32(value: number) {
    assert(memoryAccess.HEAPF32 !== null, 'diepAPI: HEAPF32 is null');
    memoryAccess.HEAPF32[this.#address >> 2] = value;
  }
  get f64(): number {
    assert(memoryAccess.HEAPF64 !== null, 'diepAPI: HEAPF64 is null');
    return memoryAccess.HEAPF64[this.#address >> 3];
  }
  set f64(value: number) {
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
