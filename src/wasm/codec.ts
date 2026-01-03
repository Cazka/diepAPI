/**
 * Encode a 32-bit float into an obfuscated 32-bit integer.
 * This is used by the game to store float values in memory in an obfuscated way.
 */
export function encode(floatBits: number): number {
  const orig = floatBits >>> 0;
  const c = ((orig ^ 112) + 11) >>> 0;
  const b = (((orig >>> 8) ^ 113) >>> 0) - c - 57;
  const d = (((orig >>> 16) ^ 110) >>> 0) - b;
  const top = (((orig >>> 24) ^ 31) >>> 0) - d;
  const result =
    (((top << 24) >>> 0) | (((d + 81) & 255) << 16) | (((b & 0xff) << 8) >>> 0) | (c & 255)) >>> 0;
  return (result + 1946157056) >>> 0;
}

/**
 * Decode an obfuscated 32-bit integer back into a 32-bit float.
 * This reverses the encode function.
 */
export function decode(encoded: number): number {
  const i = encoded >>> 0;
  const local4 = (i >>> 16) & 0xffff;
  const local5 = (i >>> 8) & 0xffffff;
  const part1 = (((local4 << 24) >>> 0) + i) & 0xff000000;
  const part2 = (i + 245) & 0xff;
  const part3 = (((local4 + local5) << 16) + 11468800) & 0x00ff0000;
  const part4 = (((i + local5) << 8) + 14592) & 0x0000ff00;
  const combined = (part1 | part2 | part3 | part4) >>> 0;
  return ((combined + 989855744) ^ 527331696) >>> 0;
}

/**
 * Encode a float value into its obfuscated representation.
 */
export function encodeFloat(v: number): number {
  return encode(f32ToU32(v));
}

/**
 * Decode an obfuscated integer back into its float representation.
 */
export function decodeFloat(e: number): number {
  return u32ToF32(decode(e));
}

function f32ToU32(f: number): number {
  return new Uint32Array(new Float32Array([f]).buffer)[0];
}
function u32ToF32(u: number): number {
  return new Float32Array(new Uint32Array([u]).buffer)[0];
}
