import { Sprite } from './sprite.js';
import { SpriteKind } from './spriteKind.js';
import { TileConstants } from './tileConstants.js';

// Positional directional sensors
const CX = [0, 16, 0, -16];
const CY = [-16, 0, 16, 0];

// Step velocities mapping to cardinal directions
const DX = [0, 4, 0, -4, 0];
const DY = [-4, 0, 4, 0, 0];

// Frame image mapping indices
const TRAIN_PIC2 = [1, 2, 1, 2, 5];

const TRA_GROOVE_X = 8;
const TRA_GROOVE_Y = 8;

const FRAME_NORTHSOUTH = 1;
const FRAME_EASTWEST = 2;
const FRAME_NW_SE = 3;
const FRAME_SW_NE = 4;
const FRAME_UNDERWATER = 5;

const DIR_NORTH = 0;
const DIR_EAST = 1;
const DIR_SOUTH = 2;
const DIR_WEST = 3;
const DIR_NONE = 4;

/**
 * Simulates a commuter train entity that traverses rails and handles path turns.
 * Ports TrainSprite.java.
 */
export class TrainSprite extends Sprite {
    /**
     * @param {object} engine - Reference to the core Micropolis engine instance.
     * @param {number} xpos - Map column index where train spawns.
     * @param {number} ypos - Map row index where train spawns.
     */
    constructor(engine, xpos, ypos) {
        super(engine, SpriteKind.TRA);
        
        this.x = xpos * 16 + TRA_GROOVE_X;
        this.y = ypos * 16 + TRA_GROOVE_Y;
        this.offx = -16;
        this.offy = -16;
        this.dir = DIR_NONE;
    }

    /**
     * Updates movement vectors and calculates path intersections across tracks.
     * @override
     */
    moveImpl() {
        // Reset diagonal switching visual frames back to straight lines
        if (this.frame === FRAME_NW_SE || this.frame === FRAME_SW_NE) {
            this.frame = TRAIN_PIC2[this.dir];
        }

        this.x += DX[this.dir];
        this.y += DY[this.dir];

        // Process grid decisions at tile alignment points
        if (this.city.acycle % 4 === 0) {
            this.x = Math.floor(this.x / 16) * 16 + TRA_GROOVE_X;
            this.y = Math.floor(this.y / 16) * 16 + TRA_GROOVE_Y;

            const d1 = this.city.PRNG.nextInt(4);

            for (let z = d1; z < d1 + 4; z++) {
                const d2 = z % 4;

                // Enforce the No-U-Turn rule
                if (this.dir !== DIR_NONE) {
                    if (d2 === (this.dir + 2) % 4) {
                        continue;
                    }
                }

                const c = this.getChar(this.x + CX[d2], this.y + CY[d2]);

                // Check for valid rail networks or power-grid crossing layers
                if ((c >= TileConstants.RAILBASE && c <= TileConstants.LASTRAIL) ||
                    c === TileConstants.RAILVPOWERH ||
                    c === TileConstants.RAILHPOWERV) 
                {
                    // Compute turning frames
                    if (this.dir !== d2 && this.dir !== DIR_NONE) {
                        if (this.dir + d2 === 3) {
                            this.frame = FRAME_NW_SE;
                        } else {
                            this.frame = FRAME_SW_NE;
                        }
                    } else {
                        this.frame = TRAIN_PIC2[d2];
                    }

                    // Check for underwater tunnels
                    if (c === TileConstants.RAILBASE || c === (TileConstants.RAILBASE + 1)) {
                        this.frame = FRAME_UNDERWATER;
                    }

                    this.dir = d2;
                    return;
                }
            }

            // If a stationary train has nowhere to go, remove it from the pool
            if (this.dir === DIR_NONE) {
                this.frame = 0;
                return;
            }

            // Stop moving if track ends
            this.dir = DIR_NONE;
        }
    }
}