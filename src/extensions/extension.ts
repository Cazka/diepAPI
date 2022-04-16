export class Extension {
    #loaded = false;
    constructor(private onload: () => void) {}

    #load() {
        if (this.#loaded) {
            return;
        }

        this.#loaded = true;

        this.onload();
    }
}
