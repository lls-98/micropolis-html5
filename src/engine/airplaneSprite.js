import { AirplaneData } from './airplaneData.js';

/**
 * AirplaneSprite handles flight calculations, waypoint updating,
 * and mid-air collisions. Ports AirplaneSprite.java.
 */
export class AirplaneSprite {
    /**
     * @param {object} city - Reference to the core Micropolis engine instance
     * @param {number} xpos - Tile-based origin X coordinate (usually an Airport tile)
     * @param {number} ypos - Tile-based origin Y coordinate
     */
    constructor(city, xpos, ypos) {
        this.city = city;
        this.kind = AirplaneData.SPRITE_KIND;

        // Convert tile index grid positions into absolute canvas rendering pixels
        this.x = xpos * 16 + 8;
        this.y = ypos * 16 + 8;
        
        this.width = AirplaneData.WIDTH;
        this.height = AirplaneData.HEIGHT;
        this.offx = AirplaneData.OFF_X;
        this.offy = AirplaneData.OFF_Y;

        this.destY = this.y;

        // Initialize takeoff boundaries: check distance to the right edge of the map
        if (xpos > this.city.getWidth() - 20) {
            // Insufficient runway room to the east; take off westbound
            this.destX = this.x - 200;
            this.frame = 7;
        } else {
            // Sufficient runway room; take off eastbound
            this.destX = this.x + 200;
            this.frame = 11;
        }
    }

    /**
     * Main movement execution tick called by the engine's master sprite manager loop.
     * Ports moveImpl() out of AirplaneSprite.java.
     */
    moveImpl() {
        let z = this.frame;

        // Navigation cycles run once every 5 simulation frame steps
        if (this.city.acycle % 5 === 0) {
            if (z > 8) { 
                // The plane is currently executing its runway takeoff cycle
                z--;
                if (z < 9) { 
                    z = 3; // Shift directly into Eastbound cruising frame
                }
                this.frame = z;
            } else { 
                // Cruising mode: steer plane toward current target waypoint
                let targetDir = this.getDir(this.x, this.y, this.destX, this.destY);
                z = this.turnTo(z, targetDir);
                this.frame = z;
            }
        }

        // Waypoint check: if plane gets within 50 pixels of its destination, pick a new target
        if (this.getDis(this.x, this.y, this.destX, this.destY) < 50) {
            // Roll a new random pixel destination anywhere inside map boundaries
            const prng = this.city.PRNG || Math;
            this.destX = Math.floor(prng.random() * this.city.getWidth()) * 16 + 8;
            this.destY = Math.floor(prng.random() * this.city.getHeight()) * 16 + 8;
        }

        // Disaster processing: verify mid-air collision criteria
        if (!this.city.noDisasters) {
            let shouldExplode = false;

            // Scan all live engine sprites for structural overlaps
            if (this.city.allSprites) {
                const sprites = this.city.allSprites();
                for (let i = 0; i < sprites.length; i++) {
                    const s = sprites[i];
                    
                    if (s !== this && 
                        (s.kind === 'AIR' || s.kind === 'COP') && 
                        this.checkSpriteCollision(s)) {
                        
                        if (s.explodeSprite) s.explodeSprite();
                        shouldExplode = true;
                    }
                }
            }

            if (shouldExplode) {
                this.explodeSprite();
                return; // Cease travel updates immediately
            }
        }

        // Apply pre-calculated pixel step vectors to translate coordinates across the grid
        this.x += AirplaneData.CDX[z];
        this.y += AirplaneData.CDY[z];
    }

    /**
     * Shared directional steering utility. Maps current coordinates to targets.
     * Overridden or shared from the base Sprite layer in the original code.
     */
    getDir(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        // Simple 8-way directional heading lookup using quadrant angle math
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle >= -22.5 && angle < 22.5) return 3;   // East
        if (angle >= 22.5 && angle < 67.5) return 4;    // Southeast
        if (angle >= 67.5 && angle < 112.5) return 5;   // South
        if (angle >= 112.5 && angle < 157.5) return 6;  // Southwest
        if (angle >= 157.5 || angle < -157.5) return 7; // West
        if (angle >= -157.5 && angle < -112.5) return 8;// Northwest
        if (angle >= -112.5 && angle < -67.5) return 1; // North
        return 2;                                       // Northeast
    }

    /**
     * Iterates the current orientation frame index 1 step closer to the target index.
     */
    turnTo(currentFrame, targetFrame) {
        if (currentFrame === targetFrame) return currentFrame;
        
        // Find shortest angular direction to step through cyclical frames (1 to 8)
        let diff = targetFrame - currentFrame;
        if (diff > 4) diff -= 8;
        if (diff < -4) diff += 8;

        if (diff > 0) {
            currentFrame++;
        } else {
            currentFrame--;
        }

        if (currentFrame > 8) currentFrame = 1;
        if (currentFrame < 1) currentFrame = 8;

        return currentFrame;
    }

    /**
     * Computes absolute Euclidean straight-line distance between two pixel coordinates.
     */
    getDis(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    /**
     * Simple bounding box intersection tester for active vehicle elements.
     */
    checkSpriteCollision(otherSprite) {
        return (
            this.x < otherSprite.x + otherSprite.width &&
            this.x + this.width > otherSprite.x &&
            this.y < otherSprite.y + otherSprite.height &&
            this.y + this.height > otherSprite.y
        );
    }

    /**
     * Triggers sprite terminal explosion actions.
     */
    explodeSprite() {
        console.log("💥 Mayday! An airplane collision has occurred!");
        if (this.city.emit) {
            this.city.emit('disaster-explosion', { x: this.x, y: this.y });
        }
    }
}