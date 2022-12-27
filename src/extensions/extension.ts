export class Extension {
    #loaded = false;

    constructor(private onload: () => void) {}

    public load() {
        if (this.#loaded) {
            return;
        }

        this.#loaded = true;

        this.onload();
    }
}
