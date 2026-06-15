import { Sprite } from './sprite.js';
import { SpriteKind } from './spriteKind.js';

// Stochastic offset tracking vectors porting static final primitive arrays CDx & CDy
const CDX = [2, 3, 2, 0, -2, -3];
const CDY = [-2, 0, 2, 3, 2, 0];

/**
 * Simulates a destructive tornado disaster entity that drifts randomly and destroys map assets.
 * Ports TornadoSprite.java.
 */
export class TornadoSprite extends Sprite {
    /**
     * @param {object} engine - Reference to the core Micropolis engine instance.
     * @param {number} xpos - Map column grid position index where disaster originates.
     * @param {number} ypos - Map row grid position index where disaster originates.
     */
    constructor(engine, xpos, ypos) {
        super(engine, SpriteKind.TOR);
        
        // Transform block map grid cells into fine pixel coordinates
        this.x = xpos * 16 + 8;
        this.y = ypos * 16 + 8;
        
        // Match the sizing coordinates specified by the engine footprint specs
        this.width = 48;
        this.height = 48;
        this.offx = -24;
        this.offy = -40;

        this.frame = 1;
        this.count = 200; // Guaranteed minimum duration step limit countdown
        this.flag = false;
    }

    /**
     * Executes the internal frame update step logic for the entity.
     * @override
     */
    moveImpl() {
        let z = this.frame;

        // Sequence cycling state machine layout management (1 -> 2 -> 3 -> 2 -> 1)
        if (z === 2) {
            z = this.flag ? 3 : 1;
        } else {
            this.flag = (z === 1);
            z = 2;
        }

        if (this.count > 0) {
            this.count--;
        }

        this.frame = z;

        // Scan for mid-air entity collection overlaps
        const spritesList = this.city.allSprites();
        for (let i = 0; i < spritesList.length; i++) {
            const s = spritesList[i];
            if (this.checkSpriteCollision(s)) {
                if (s.kind === SpriteKind.AIR ||
                    s.kind === SpriteKind.COP ||
                    s.kind === SpriteKind.SHI ||
                    s.kind === SpriteKind.TRA) 
                {
                    s.explodeSprite();
                }
            }
        }

        // Draw a random offset change from the stochastic tracking tables
        const zz = this.city.PRNG.nextInt(CDX.length);
        this.x += CDX[zz];
        this.y += CDY[zz];

        const tileX = Math.floor(this.x / 16);
        const tileY = Math.floor(this.y / 16);

        // Terminate execution if the path passes outside playable zone boundaries
        if (!this.city.testBounds(tileX, tileY)) {
            this.frame = 0; // Flags core pool collector to reap sprite asset instance
            return;
        }

        // Stochastic self-termination calculation if minimum steps are depleted
        if (this.count === 0 && this.city.PRNG.nextInt(501) === 0) {
            this.frame = 0;
            return;
        }

        // Commit spatial layout modification updates to map grid cell
        this.city.destroyTile(tileX, tileY);
    }
}