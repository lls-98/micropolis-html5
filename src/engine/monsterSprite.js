import { Sprite } from './sprite.js';
import { SpriteKind } from './spriteKind.js';
import { Sound } from './sound.js';
import { MicropolisMessage } from './micropolisMessage.js';
import { TileConstants } from './tileConstants.js';

/**
 * MonsterSprite simulates Zilla—the environmental disaster agent.
 * Tracks pollution hot-spots, path-finds with swagger animations,
 * and crushes conflicting transportation agents.
 * Ports MonsterSprite.java.
 */
export class MonsterSprite extends Sprite {
    // Movement delta steps corresponding to basic direction indices 0...4
    static Gx = new Int32Array([2, 2, -2, -2, 0]);
    static Gy = new Int32Array([-2, 2, 2, -2, 0]);

    // Next direction pivot mappings when executing turns from diagonal stances
    static ND1 = new Int32Array([0, 1, 2, 3]);
    static ND2 = new Int32Array([1, 2, 3, 0]);

    // Cardinal transition targets pointing back to diagonal frame baselines
    static nn1 = new Int32Array([2, 5, 8, 11]);
    static nn2 = new Int32Array([11, 2, 5, 8]);

    /**
     * @param {object} engine - Core Micropolis simulation engine context.
     * @param {number} xpos - Initial tile coordinate X.
     * @param {number} ypos - Initial tile coordinate Y.
     */
    constructor(engine, xpos, ypos) {
        super(engine, SpriteKind.GOD);
        
        this.x = xpos * 16 + 8;
        this.y = ypos * 16 + 8;
        this.width = 48;
        this.height = 48;
        this.offx = -24;
        this.offy = -24;

        this.origX = this.x;
        this.origY = this.y;

        // Determine edge entry quadrant to face the creature inwards appropriately
        const midWidth = Math.floor(this.city.getWidth() / 2);
        const midHeight = Math.floor(this.city.getHeight() / 2);
        if (xpos > midWidth) {
            this.frame = (ypos > midHeight) ? 10 : 7;
        } else {
            this.frame = (ypos > midHeight) ? 1 : 4;
        }

        this.count = 1000;
        this.soundCount = 0;
        this.step = 1;
        this.flag = false; // Tracks if monster is heading home

        // Route directly toward the center of pollution density
        const pollutionCenter = this.city.getLocationOfMaxPollution();
        this.destX = pollutionCenter.x * 16 + 8;
        this.destY = pollutionCenter.y * 16 + 8;
    }

    /**
     * Performs structural coordinate state mutations and interactions for the monster.
     * Ports moveImpl().
     */
    moveImpl() {
        if (this.frame === 0) {
            return;
        }

        if (this.soundCount > 0) {
            this.soundCount--;
        }

        let d = Math.floor((this.frame - 1) / 3);   // Basic diagonal heading direction (0...3) or Pause stance (4)
        let z = (this.frame - 1) % 3;               // Animation index phase state within the sub-frame window

        if (d < 4) {
            // Processing dynamic walking steps through diagonal coordinates
            if (this.step !== -1 && this.step !== 1) {
                this.step = 1;
            }
            if (z === 2) this.step = -1;
            if (z === 0) this.step = 1;
            z += this.step;

            // Check distance threshold to determine if target vector has been reached
            if (this.getDis(this.x, this.y, this.destX, this.destY) < 60) {
                if (!this.flag) {
                    // Epicenter leveled. Reverse tracking parameters to return home.
                    this.flag = true;
                    this.destX = this.origX;
                    this.destY = this.origY;
                    this.city.sendMessageAt(MicropolisMessage.MONSTER_REPORT, Math.floor(this.x / 16), Math.floor(this.y / 16));
                } else {
                    // Safe exit threshold completed. Culled from execution loop.
                    this.frame = 0;
                    return;
                }
            }

            // Calculate objective destination target route vectors
            let c = this.getDir(this.x, this.y, this.destX, this.destY);
            c = Math.floor((c - 1) / 2); // Map out structural 8-way bearing down to 4 quadrant frames

            // Introduce a 1-in-11 chance to initiate turn adjustments
            if (c !== d && this.city.PRNG.nextInt(11) === 0) {
                if (this.city.PRNG.nextInt(2) === 0) {
                    z = MonsterSprite.ND1[d];
                } else {
                    z = MonsterSprite.ND2[d];
                }
                d = 4; // Shift frame selector to cardinal pause register

                if (this.soundCount === 0) {
                    this.city.makeSound(Math.floor(this.x / 16), Math.floor(this.y / 16), Sound.MONSTER);
                    this.soundCount = 50 + this.city.PRNG.nextInt(101);
                }
            }
        } else {
            // Handle transition frame adjustments (Stances 13...16)
            const z2 = (this.frame - 13) % 4;

            if (this.city.PRNG.nextInt(4) === 0) {
                let newFrame;
                if (this.city.PRNG.nextInt(2) === 0) {
                    newFrame = MonsterSprite.nn1[z2];
                } else {
                    newFrame = MonsterSprite.nn2[z2];
                }
                d = Math.floor((newFrame - 1) / 3);
                z = (newFrame - 1) % 3;
            } else {
                d = 4; // Keep body locked in cardinal step focus
            }
        }

        // Reconstitute the tracking frame token calculation
        this.frame = ((d * 3) + z) + 1;

        // Apply positioning translation mutations
        this.x += MonsterSprite.Gx[d];
        this.y += MonsterSprite.Gy[d];

        if (this.count > 0) {
            this.count--;
        }

        // Out-of-bounds map boundary validation check
        const tileChar = this.getChar(this.x, this.y);
        if (tileChar === -1) {
            this.frame = 0; // Terminate entity safely
            return;
        }

        // Loop through and destroy transportation agents caught inside the avatar's boundary
        const entities = this.city.allSprites();
        for (const s of entities) {
            if (this.checkSpriteCollision(s)) {
                if (s.kind === SpriteKind.AIR ||
                    s.kind === SpriteKind.COP ||
                    s.kind === SpriteKind.SHI ||
                    s.kind === SpriteKind.TRA) {
                    s.explodeSprite();
                }
            }
        }

        // Perform terrain destruction pass on the active map cell block
        if (typeof this.city.destroyTile === 'function') {
            this.city.destroyTile(Math.floor(this.x / 16), Math.floor(this.y / 16));
        }
    }
}