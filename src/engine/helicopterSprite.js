import { Sprite } from './sprite.js';
import { HelicopterData } from './helicopterData.js';

/**
 * HelicopterSprite handles airport flight operations, news reports,
 * and disaster-seeking paths. Ports HelicopterSprite.java.
 */
export class HelicopterSprite extends Sprite {
    /**
     * @param {object} engine - Core simulation engine context instance
     * @param {number} tileX - Landing pad coordinate x anchor
     * @param {number} tileY - Landing pad coordinate y anchor
     */
    constructor(engine, tileX, tileY) {
        super(engine, HelicopterData.SPRITE_KIND);

        // Convert center point to fine grid sub-pixel spaces
        this.x = tileX * 16 + 8;
        this.y = tileY * 16 + 8;
        this.width = 32;
        this.height = 32;
        this.offx = -16;
        this.offy = -16;

        const prng = this.city.PRNG || Math;
        const mapWidth = this.city.getWidth ? this.city.getWidth() : 120;
        const mapHeight = this.city.getHeight ? this.city.getHeight() : 100;

        // Establish randomized initial patrol target points
        this.destX = Math.floor(prng.random() * mapWidth) * 16 + 8;
        this.destY = Math.floor(prng.random() * mapHeight) * 16 + 8;

        // Remember physical origin point coordinates for landing phases
        this.origX = this.x;
        this.origY = this.y;

        this.count = HelicopterData.BASE_ENDURANCE;
        this.frame = 5; // Default initial rotation perspective index
    }

    /**
     * Executes localized flight trajectory corrections and handles environment polling.
     * Ports moveImpl() from HelicopterSprite.java.
     */
    moveImpl() {
        // Step A: Decrement operational mission flight time
        if (this.count > 0) {
            this.count--;
        }

        // Step B: Evaluate landing parameters or prioritize hazard tracking magnets
        if (this.count === 0) {
            if (this.city.hasSprite && this.city.hasSprite('GOD')) {
                const monster = this.city.getSprite('GOD');
                if (monster) {
                    this.destX = monster.x;
                    this.destY = monster.y;
                }
            } else if (this.city.hasSprite && this.city.hasSprite('TOR')) {
                const tornado = this.city.getSprite('TOR');
                if (tornado) {
                    this.destX = tornado.x;
                    this.destY = tornado.y;
                }
            } else {
                // Route directly back to base runway pad
                this.destX = this.origX;
                this.destY = this.origY;
            }

            // If hovering directly over the airfield, clear sprite and land
            if (this.getDis(this.x, this.y, this.origX, this.origY) < HelicopterData.LANDING_RADIUS) {
                this.frame = 0; // Signals structural retirement to container framework loops
                return;
            }
        }

        // Step C: Execute periodic traffic monitoring audits
        if (this.city.acycle % HelicopterData.SOUND_FREQ === 0) {
            const currentTileX = Math.floor(this.x / 16);
            const currentTileY = Math.floor(this.y / 16);

            const trafficDensity = this.city.getTrafficDensity ? this.city.getTrafficDensity(currentTileX, currentTileY) : 0;
            const prng = this.city.PRNG || Math;

            if (trafficDensity > HelicopterData.TRAFFIC_THRESHOLD && Math.floor(prng.random() * 8) === 0) {
                if (this.city.sendMessageAt) {
                    this.city.sendMessageAt('HEAVY_TRAFFIC_REPORT', currentTileX, currentTileY);
                }
                if (this.city.makeSound) {
                    this.city.makeSound(currentTileX, currentTileY, 'HEAVYTRAFFIC');
                }
            }
        }

        // Step D: Calculate step modifications and apply velocity updates
        let targetFrame = this.frame;
        if (this.city.acycle % 3 === 0) {
            const calculatedDirection = this.getDir(this.x, this.y, this.destX, this.destY);
            if (this.turnTo) {
                targetFrame = this.turnTo(targetFrame, calculatedDirection);
            }
            this.frame = targetFrame;
        }

        // Step E: Displace position along chosen vector offsets
        this.x += HelicopterData.CDX[targetFrame] || 0;
        this.y += HelicopterData.CDY[targetFrame] || 0;
    }
}