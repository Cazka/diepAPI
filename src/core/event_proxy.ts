/**
 * Wraps an event object in a Proxy that returns true for isTrusted
 */
function getProxiedEvent(event: Event): Event {
  const handler: ProxyHandler<Event> = {
    get(target, prop, receiver) {
      if (prop === 'isTrusted') {
        return true;
      }

      return Reflect.get(target, prop, target);
    },
  };

  return new Proxy(event, handler);
}

/**
 * Wraps an event listener to proxy events before they reach the handler
 */
function getProxiedListener(listener: EventListener): EventListener {
  const handler = {
    apply(target: EventListener, thisArg: unknown, args: [Event]) {
      args[0] = getProxiedEvent(args[0]);

      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      return Reflect.apply(target, thisArg, args);
    },
  };

  return new Proxy(listener, handler);
}

/**
 * Installs the event proxy system by hooking addEventListener
 */
export function installEventProxy(): void {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  EventTarget.prototype.addEventListener = new Proxy(EventTarget.prototype.addEventListener, {
    apply(target, thisArg, args: ['string', EventListenerOrEventListenerObject, boolean?]) {
      if (args[1] instanceof Function) {
        args[1] = getProxiedListener(args[1]);

        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        return Reflect.apply(target, thisArg, args);
      }

      if (args[1] instanceof Object && args[1].handleEvent instanceof Function) {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        args[1].handleEvent = getProxiedListener(args[1].handleEvent);

        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        return Reflect.apply(target, thisArg, args);
      }

      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      return Reflect.apply(target, thisArg, args);
    },
  });
}
