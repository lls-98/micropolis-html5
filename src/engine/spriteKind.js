/**
 * SpriteKind lists the unique identifiers and frame constraints for mobile actors.
 * Ports SpriteKind.java.
 */
export class SpriteKind {
    static TRA = new SpriteKind('TRA', 1, 5);  // Train
    static COP = new SpriteKind('COP', 2, 8);  // Helicopter
    static AIR = new SpriteKind('AIR', 3, 11); // Airplane
    static SHI = new SpriteKind('SHI', 4, 8);  // Cargo Ship
    static GOD = new SpriteKind('GOD', 5, 16); // Godzilla-like Monster
    static TOR = new SpriteKind('TOR', 6, 3);  // Tornado
    static EXP = new SpriteKind('EXP', 7, 6);  // Explosion
    static BUS = new SpriteKind('BUS', 8, 4);  // Bus

    /**
     * @param {string} name - String representation token.
     * @param {number} objectId - Legacy matching identifier integer index.
     * @param {number} numFrames - Total animation frames allocated.
     */
    constructor(name, objectId, numFrames) {
        this.name = name;
        this.objectId = objectId;
        this.numFrames = numFrames;
        Object.freeze(this);
    }

    /**
     * Returns an array containing all defined sprite kinds.
     * @returns {SpriteKind[]}
     */
    static values() {
        return [
            this.TRA,
            this.COP,
            this.AIR,
            this.SHI,
            this.GOD,
            this.TOR,
            this.EXP,
            this.BUS
        ];
    }

    /**
     * Look up a sprite configuration by its object ID number.
     * @param {number} id 
     * @returns {SpriteKind|null}
     */
    static fromId(id) {
        return this.values().find(k => k.objectId === id) || null;
    }

    toString() {
        return `SpriteKind.${this.name} (ID: ${this.objectId}, Frames: ${this.numFrames})`;
    }
}

Object.freeze(SpriteKind);