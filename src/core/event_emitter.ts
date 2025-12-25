export abstract class EventEmitter<Event extends string> extends EventTarget {
  protected emit(eventName: Event, ...args: unknown[]): void {
    super.dispatchEvent(new CustomEvent(eventName, { detail: args }));
  }

  on(eventName: Event, listener: EventListener): void {
    super.addEventListener(eventName, ((e: CustomEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Reflect.apply(listener, this, e.detail);
    }) as EventListener);
  }

  once(eventName: Event, listener: EventListener): void {
    super.addEventListener(
      eventName,
      ((e: CustomEvent) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        Reflect.apply(listener, this, e.detail);
      }) as EventListener,
      {
        once: true,
      },
    );
  }

  off(eventName: Event, listener: EventListener): void {
    super.removeEventListener(eventName, listener);
  }
}
