import { Sprite } from './sprite.js'; // Assuming a baseline shared Sprite parent wrapper
import { ExplosionData } from './explosionData.js';

/**
 * ExplosionSprite manages transient blast animations, play audio cues,
 * and ignite adjacent structures upon expiration. Ports ExplosionSprite.java.
 */
export class ExplosionSprite extends Sprite {
    /**
     * @param {object} engine - Reference to the core Micropolis engine instance
     * @param {number} pixelX - Target horizontal position in fine pixels
     * @param {number} pixelY - Target vertical position in fine pixels
     */
    constructor(engine, pixelX, pixelY) {
        super(engine, ExplosionData.SPRITE_KIND);
        
        this.x = pixelX;
        this.y = pixelY;
        this.width = ExplosionData.DIMENSION;
        this.height = ExplosionData.DIMENSION;
        this.offx = ExplosionData.OFFSET;
        this.offy = ExplosionData.OFFSET;
        this.frame = 1;
    }

    /**
     * Ticks the explosion physics and manages frame cycles.
     * Ports moveImpl() from ExplosionSprite.java.
     */
    moveImpl() {
        const TC = this.city.constants;

        // Frame rate limiter: Advance frame every 2 simulation cycles
        if (this.city.acycle % 2 === 0) {
            if (this.frame === 1) {
                const tileX = Math.floor(this.x / 16);
                const tileY = Math.floor(this.y / 16);

                // Fire high-priority sound cue and update ticker alerts
                if (this.city.makeSound) {
                    this.city.makeSound(tileX, tileY, 'EXPLOSION_HIGH');
                }
                if (this.city.sendMessageAt) {
                    this.city.sendMessageAt('EXPLOSION_REPORT', tileX, tileY);
                }
            }
            this.frame++;
        }

        // Handle expiration and trigger collateral structural combustion
        if (this.frame > ExplosionData.MAX_FRAMES) {
            this.frame = 0; // Signals entity removal to the sprite manager array

            const centerTileX = Math.floor(this.x / 16);
            const centerTileY = Math.floor(this.y / 16);

            // Execute the 5-point ignition matrix
            for (const target of ExplosionData.FIRE_SCATTER_GRID) {
                this.startFire(centerTileX + target.dx, centerTileY + target.dy);
            }
        }
    }

    /**
     * Validates safety bounds and sets combustible assets ablaze.
     * Ports startFire() from ExplosionSprite.java.
     */
    startFire(tileX, tileY) {
        if (!this.city.testBounds(tileX, tileY)) {
            return;
        }

        const TC = this.city.constants;
        const tileID = this.city.getTile(tileX, tileY);

        // Verify if tile can burn or is plain dirt
        const checkCombustible = this.city.isCombustible ? this.city.isCombustible(tileID) : false;
        if (!checkCombustible && tileID !== TC.DIRT) {
            return;
        }

        // Skip if the targeted tile matches a central zone anchor point
        const checkZoneCenter = this.city.isZoneCenter ? this.city.isZoneCenter(tileID) : false;
        if (checkZoneCenter) {
            return;
        }

        // Spark fire!
        this.city.setTile(tileX, tileY, TC.FIRE);
    }
}