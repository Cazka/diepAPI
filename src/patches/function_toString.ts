// eslint-disable-next-line @typescript-eslint/unbound-method
Function.prototype.toString = new Proxy(Function.prototype.toString, {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  apply(target, thisArg: Function, args) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = Reflect.apply(target, thisArg, args);

    if (result === `function () { [native code] }` && thisArg.name.length > 0) {
      return `function ${thisArg.name}() { [native code] }`;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  },
});
