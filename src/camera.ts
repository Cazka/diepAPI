import { Vector } from './vector';
import { arena } from './arena';
import { minimap } from './minimap';

class Camera {
    get position(): Vector {
        const center = Vector.add(minimap.viewportPos, Vector.scale(0.5, minimap.viewportDim));
        const cameraPos = Vector.subtract(center, minimap.minimapPos);
        const normalized = Vector.divide(cameraPos, minimap.minimapDim);
        return arena.scale(normalized);
    }
}

export const camera = new Camera();
