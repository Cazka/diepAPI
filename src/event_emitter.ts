type EventCallback = (...args: any) => void;

export abstract class EventEmitter extends EventTarget {
    /**
     *
     * @param {string} eventName The name of the event
     * @param  {...any} args The arguments that will be passed to the listener
     */
    protected emit(eventName: string, ...args: any): void {
        this.dispatchEvent(new CustomEvent(eventName, { detail: args }));
    }

    /**
     *
     * @param {string} eventName The name of the event
     * @param {EventCallback} listener The callback function
     */
    on(eventName: string, listener: EventCallback): void {
        this.addEventListener(eventName, (e: CustomEvent) => Reflect.apply(listener, this, e.detail));
    }

    /**
     *
     * @param {string} eventName The name of the event
     * @param {EventCallback} listener The callback function
     */
    once(eventName: string, listener: EventCallback): void {
        this.addEventListener(eventName, (e: CustomEvent) => Reflect.apply(listener, this, e.detail), { once: true });
    }

    /**
     *
     * @param {string} eventName The name of the event
     * @param {EventCallback} listener The callback function
     */
    off(eventName: string, listener: EventCallback): void {
        this.removeEventListener(eventName, listener);
    }
}
