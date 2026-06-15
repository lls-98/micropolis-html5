import { SpriteKind } from './spriteKind.js';
import { TileConstants } from './tileConstants.js';

/**
 * Sprite acts as the abstract base class for all mobile entities on the map.
 * Manages fine sub-pixel coordinates, collision detection vectors, and tile damage.
 * Ports Sprite.java.
 * @abstract
 */
export class Sprite {
    /**
     * @param {object} engine - Core Micropolis simulation engine context.
     * @param {string} kind - The structural entity type enum token from SpriteKind.
     */
    constructor(engine, kind) {
        if (this.constructor === Sprite) {
            throw new Error("Abstract class 'Sprite' cannot be instantiated directly.");
        }

        this.city = engine;
        this.kind = kind;

        // Visual presentation bounds offset parameters
        this.offx = 0;
        this.offy = 0;
        this.width = 32;
        this.height = 32;

        // Tracking frame state registers
        this.frame = 0;

        // Sub-pixel position registers (1 Tile = 16 sub-pixel units)
        this.x = 0;
        this.y = 0;

        // Historic coordinate markers for interpolation passes
        this.lastX = 0;
        this.lastY = 0;

        this.dir = 0;
    }

    /**
     * Abstract method stub. Every entity subclass must implement its own logic loop.
     * Ports moveImpl().
     * @abstract
     */
    moveImpl() {
        throw new Error(`Subclass '${this.constructor.name}' must implement abstract method 'moveImpl'.`);
    }

    /**
     * Returns the underlying tile index signature if the coordinates fall inside the map layout.
     * Ports getChar().
     * @param {number} subX - Fine absolute position X.
     * @param {number} subY - Fine absolute position Y.
     * @returns {number} The raw numerical tile characteristic value, or -1 if out of bounds.
     */
    getChar(subX, subY) {
        const xpos = Math.floor(subX / 16);
        const ypos = Math.floor(subY / 16);
        if (this.city.testBounds(xpos, ypos)) {
            return this.city.getTile(xpos, ypos);
        }
        return -1;
    }

    /**
     * Computes the mathematical absolute directional bearing index between two fine coordinate blocks.
     * Returns an octant index mapped clockwise 1-to-8 (1=N, 2=NE, 3=E, 4=SE, 5=S, 6=SW, 7=W, 8=NW).
     * Ports getDir().
     */
    getDir(orgX, orgY, tgtX, tgtY) {
        const dx = tgtX - orgX;
        const dy = tgtY - orgY;
        const ax = Math.abs(dx);
        const ay = Math.abs(dy);

        if (dx >= 0) {
            if (dy >= 0) {
                // Quadrant 2: East / South-East / South
                return (ax > (ay * 2)) ? 3 : ((ay > (ax * 2)) ? 5 : 4);
            } else {
                // Quadrant 1: North / North-East / East
                return (ax > (ay * 2)) ? 3 : ((ay > (ax * 2)) ? 1 : 2);
            }
        } else {
            if (dy >= 0) {
                // Quadrant 3: South / South-West / West
                return (ax > (ay * 2)) ? 7 : ((ay > (ax * 2)) ? 5 : 6);
            } else {
                // Quadrant 4: West / North-West / North
                return (ax > (ay * 2)) ? 7 : ((ay > (ax * 2)) ? 1 : 8);
            }
        }
    }

    /**
     * Computes an expedited Chebyshev/Manhattan distance estimation index between coordinates.
     * Ports getDis().
     */
    getDis(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    /**
     * Incrementally rotates an animation frame index closer to a targeted heading index.
     * Ports turnTo().
     */
    turnTo(currentFrame, targetHeading) {
        if (currentFrame === targetHeading) {
            return currentFrame;
        }

        let z = currentFrame - targetHeading;
        if (z < 0) {
            z += 8;
        }

        if (z > 4) {
            currentFrame++; // Rotate clockwise
        } else {
            currentFrame--; // Rotate counter-clockwise
        }

        if (currentFrame > 8) currentFrame = 1;
        if (currentFrame < 1) currentFrame = 8;

        return currentFrame;
    }

    /**
     * Checks if the sprite's visibility layer is active.
     * Ports isVisible().
     * @returns {boolean}
     */
    isVisible() {
        return this.frame > 0;
    }

    /**
     * Triggers a self-destruct cycle by replacing this sprite with an explosion configuration.
     * Ports explodeSprite().
     */
    explodeSprite() {
        this.frame = 0; // Disable visibility
        if (typeof this.city.makeExplosion === 'function') {
            this.city.makeExplosion(Math.floor(this.x / 16), Math.floor(this.y / 16));
        }
    }

    /**
     * Evaluates bounding-box overlaps to determine collisions with other active entities.
     * Ports checkSpriteCollision().
     * @param {Sprite} otherSprite 
     * @returns {boolean} True if a collision occurs.
     */
    checkSpriteCollision(otherSprite) {
        if (!this.isVisible() || !otherSprite || !otherSprite.isVisible()) {
            return false;
        }
        return this.getDis(this.x, this.y, otherSprite.x, otherSprite.y) < 30;
    }

    /**
     * Destroys municipal structures or terrain assets at a targeted grid coordinate.
     * Replaces tiles with water, rubble, explosions, or fire markers.
     * Ports destroyTile().
     */
    destroyTile(xpos, ypos) {
        if (!this.city.testBounds(xpos, ypos)) {
            return;
        }

        // Shared compatibility hooks expected from engine utilities
        const tileUtils = this.city.tileUtils || {
            isOverWater: (t) => t === TileConstants.RIVER || t === TileConstants.CHANNEL,
            isRoad: (t) => t >= TileConstants.ROADBASE && t < TileConstants.RAILBASE,
            isCombustible: (t) => t > TileConstants.WOODS,
            isZoneCenter: (t) => (t % 16 === 0), // Fallback zone test heuristic
            getZoneSizeFor: (t) => ({ width: 3, height: 3 })
        };

        const t = this.city.getTile(xpos, ypos);

        if (tileUtils.isOverWater(t)) {
            if (tileUtils.isRoad(t)) {
                // Road bridge collapses into standard open water
                this.city.setTile(xpos, ypos, TileConstants.RIVER);
            }
            // Submerged infrastructure lines are shielded from structural sprite damage
            return;
        }

        if (!tileUtils.isCombustible(t)) {
            return;
        }

        if (tileUtils.isZoneCenter(t)) {
            if (typeof this.city.killZone === 'function') {
                this.city.killZone(xpos, ypos, t);
            }

            const dims = tileUtils.getZoneSizeFor(t);
            if (dims.width >= 3 && dims.height >= 3) {
                if (typeof this.city.makeExplosion === 'function') {
                    this.city.makeExplosion(xpos, ypos);
                }
                return;
            }
        }

        // Single cells default to a small visual puff animation frame
        this.city.setTile(xpos, ypos, TileConstants.TINYEXP);
    }
}