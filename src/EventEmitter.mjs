export default class EventEmitter extends EventTarget {
    /**
     *
     * @param {string} eventName The name of the event
     * @param  {...any} args The arguments that will be passed to the listener
     */
    emit(eventName, ...args) {
        this.dispatchEvent(new CustomEvent(eventName, { detail: args }));
    }

    /**
     *
     * @param {string} eventName The name of the event
     * @param {Function} listener The callback function
     */
    on(eventName, listener) {
        this.addEventListener(eventName, (e) => Reflect.apply(listener, this, e.detail));
    }

    /**
     *
     * @param {string} eventName The name of the event
     * @param {Function} listener The callback function
     */
    once(eventName, listener) {
        this.addEventListener(eventName, (e) => Reflect.apply(listener, this, e.detail), { once: true });
    }

    /**
     *
     * @param {string} eventName The name of the event
     * @param {Function} listener The callback function
     */
    off(eventName, listener) {
        this.removeEventListener(eventName, listener);
    }
}
