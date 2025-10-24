export abstract class EventEmitter extends EventTarget {
  protected emit(eventName: string, ...args: any): void {
    super.dispatchEvent(new CustomEvent(eventName, { detail: args }));
  }

  on(eventName: string, listener: EventListener): void {
    super.addEventListener(eventName, ((e: CustomEvent) =>
      Reflect.apply(listener, this, e.detail)) as EventListener);
  }

  once(eventName: string, listener: EventListener): void {
    super.addEventListener(
      eventName,
      ((e: CustomEvent) => Reflect.apply(listener, this, e.detail)) as EventListener,
      {
        once: true,
      },
    );
  }

  off(eventName: string, listener: EventListener): void {
    super.removeEventListener(eventName, listener);
  }
}
