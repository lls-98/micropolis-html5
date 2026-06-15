import { Sprite } from './sprite.js';
import { SpriteKind } from './spriteKind.js';
import { Sound } from './sound.js';
import { TileConstants } from './tileConstants.js';

/**
 * ShipSprite simulates maritime cargo ships traversing river channels.
 * Validates passable aquatic infrastructure and crashes into land or closed bridges.
 * Ports ShipSprite.java.
 */
export class ShipSprite extends Sprite {
    // 1-based tile search offsets (index 0 is a padding placeholder)
    static BDx = new Int32Array([0,  0,  1,  1,  1,  0, -1, -1, -1]);
    static BDy = new Int32Array([0, -1, -1,  0,  1,  1,  1,  0, -1]);

    // 1-based sub-pixel travel steps per cycle
    static BPx = new Int32Array([0,  0,  2,  2,  2,  0, -2, -2, -2]);
    static BPy = new Int32Array([0, -2, -2,  0,  2,  2,  2,  0, -2]);

    // Passable marine tiles matrix configurations
    static BtClrTab = new Int32Array([
        TileConstants.RIVER,
        TileConstants.CHANNEL,
        TileConstants.POWERBASE,
        TileConstants.POWERBASE + 1,
        TileConstants.RAILBASE,
        TileConstants.RAILBASE + 1,
        TileConstants.BRWH,
        TileConstants.BRWV
    ]);

    static NORTH_EDGE = 5;
    static EAST_EDGE = 7;
    static SOUTH_EDGE = 1;
    static WEST_EDGE = 3;

    /**
     * @param {object} engine - Core Micropolis simulation engine context.
     * @param {number} xpos - Tile coordinate position X.
     * @param {number} ypos - Tile coordinate position Y.
     * @param {number} edge - The initial entry edge frame orientation index heading.
     */
    constructor(engine, xpos, ypos, edge) {
        super(engine, SpriteKind.SHI);
        this.x = xpos * 16 + 8;
        this.y = ypos * 16 + 8;
        this.width = 48;
        this.height = 48;
        this.offx = -24;
        this.offy = -24;
        
        this.frame = edge;
        this.newDir = edge;
        this.dir = 10; // Sentinal index bypassing initial backward turn blocks
        this.count = 1;
        this.soundCount = 1;
    }

    /**
     * Executes maritime navigation pathing state mutations.
     * Ports moveImpl().
     */
    moveImpl() {
        let t = TileConstants.RIVER;

        this.soundCount--;
        if (this.soundCount <= 0) {
            if (this.city.PRNG.nextInt(4) === 0) {
                this.city.makeSound(Math.floor(this.x / 16), Math.floor(this.y / 16), Sound.HONKHONK_LOW);
            }
            this.soundCount = 200;
        }

        this.count--;
        if (this.count <= 0) {
            this.count = 9;

            // Turn towards the intended vector before selecting the next cell
            if (this.newDir !== this.frame) {
                this.frame = this.turnTo(this.frame, this.newDir);
                return;
            }

            const tem = this.city.PRNG.nextInt(8);
            let pem;
            
            // Loop over all 8 directions to discover an open water channel
            for (pem = tem; pem < (tem + 8); pem++) {
                const z = (pem % 8) + 1;
                if (z === this.dir) {
                    continue; // Skip the heading that moves directly backwards
                }

                const xpos = Math.floor(this.x / 16) + ShipSprite.BDx[z];
                const ypos = Math.floor(this.y / 16) + ShipSprite.BDy[z];

                if (this.city.testBounds(xpos, ypos)) {
                    t = this.city.getTile(xpos, ypos);

                    if (t === TileConstants.CHANNEL || 
                        t === TileConstants.BRWH || 
                        t === TileConstants.BRWV ||
                        this.tryOther(t, this.dir, z)) 
                    {
                        this.newDir = z;
                        this.frame = this.turnTo(this.frame, this.newDir);
                        
                        // Set backward block threshold vector indices
                        this.dir = z + 4;
                        if (this.dir > 8) {
                            this.dir -= 8;
                        }
                        break;
                    }
                }
            }

            // If dead-ended, pick a random path and allow turning around
            if (pem === (tem + 8)) {
                this.dir = 10;
                this.newDir = this.city.PRNG.nextInt(8) + 1;
            }
        } else {
            // Actively advance position through the current cycle
            const z = this.frame;
            if (z === this.newDir) {
                this.x += ShipSprite.BPx[z];
                this.y += ShipSprite.BPy[z];
            }
        }

        // Out of bounds check
        if (!this.spriteInBounds()) {
            this.frame = 0;
            return;
        }

        // Validate the underlying terrain tile is safe for ships
        let found = false;
        for (let i = 0; i < ShipSprite.BtClrTab.length; i++) {
            if (t === ShipSprite.BtClrTab[i]) {
                found = true;
                break;
            }
        }

        // Trigger a shipwreck if the ship runs aground or hits a closed bridge
        if (!found) {
            if (!this.city.noDisasters) {
                this.explodeSprite();
                if (typeof this.city.destroyTile === 'function') {
                    this.city.destroyTile(Math.floor(this.x / 16), Math.floor(this.y / 16));
                }
            }
        }
    }

    /**
     * Checks if underwater wiring or rails are traversed in a straight line.
     * Ports tryOther().
     */
    tryOther(tile, oldDir, newDir) {
        let z = oldDir + 4;
        if (z > 8) {
            z -= 8;
        }
        if (newDir !== z) {
            return false;
        }

        return (tile === TileConstants.POWERBASE || 
                tile === TileConstants.POWERBASE + 1 ||
                tile === TileConstants.RAILBASE || 
                tile === TileConstants.RAILBASE + 1);
    }

    /**
     * Bounds validation check helper.
     * Ports spriteInBounds().
     * @returns {boolean}
     */
    spriteInBounds() {
        const xpos = Math.floor(this.x / 16);
        const ypos = Math.floor(this.y / 16);
        return this.city.testBounds(xpos, ypos);
    }
}