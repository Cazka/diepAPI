import Movement from './movement.mjs';
import CanvasKit from './canvasKit.mjs';
import Minimap from './minimap.mjs';
import Arena from './arena.mjs';

let instance = null;

export default class PlayerMovement extends Movement {
    /**
     * Using the minimap arrow to get the player position and velocity
     */
    constructor() {
        super();
        if (instance) return instance;
        instance = this;

        const minimap = new Minimap();
        const arena = new Arena();

        CanvasKit.hookRAF(() => {
            this.updatePos(arena.scale(minimap.arrowPos));
        });
    }
}
