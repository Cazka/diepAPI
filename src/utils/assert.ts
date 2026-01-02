export function assert(predicate: boolean, message?: string): asserts predicate {
  if (!predicate) {
    console.error('Assertion failed:', message);
  }
}
