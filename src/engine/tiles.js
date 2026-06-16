import { TileSpec } from './tileSpec.js';

/**
 * Tiles registry acts as a singleton container for all tile definitions.
 */
export class Tiles {
    static tiles = [];
    static tilesByName = new Map();

    /**
     * Bootstraps the grid specification mapping structure using raw recipe properties.
     * Matches the call expected by main.js.
     * @param {object} tilesRc - Key-value pair collection mirroring tile specifications.
     */
    static initialize(tilesRc) {
        Tiles.tiles = [];
        Tiles.tilesByName.clear();

        // Generate names array using keys or numeric sequences from the config recipe
        const tileNames = Object.keys(tilesRc);
        
        // Find the maximum numeric tile ID to safely dimension our index array
        let maxId = 0;
        for (const name of tileNames) {
            if (/^\d+$/.test(name)) {
                maxId = Math.max(maxId, parseInt(name, 10));
            }
        }
        
        // Size the internal array to fit all raw tiles or string indices
        Tiles.tiles = new Array(Math.max(maxId + 1, tileNames.length));

        // First pass: Instantiate individual TileSpecs
        for (const tileName of tileNames) {
            const rawSpec = tilesRc[tileName];
            
            // Assuming TileSpec has a parsing engine attached
            // If TileSpec constructor signature is (id, name, rawText), adapt here:
            let numericId = /^\d+$/.test(tileName) ? parseInt(tileName, 10) : tileNames.indexOf(tileName);
            
            // Using a resilient parsing approach matching our previous TileSpec specifications
            const ts = typeof TileSpec.parse === 'function' 
                ? TileSpec.parse(numericId, tileName, rawSpec, tilesRc)
                : new TileSpec(numericId, tileName, { rawSpec });

            Tiles.tilesByName.set(tileName, ts);
            if (/^\d+$/.test(tileName)) {
                Tiles.tiles[numericId] = ts;
            }
        }

        // Second pass: Cross-resolve structural parent/child reference networks
        for (const name of Tiles.tilesByName.keys()) {
            const ts = Tiles.tilesByName.get(name);
            if (ts && typeof ts.resolveReferences === 'function') {
                ts.resolveReferences(Tiles.tilesByName);
            }
        }
    }

    /**
     * Legacy async asset loader block retained for backward compatibility
     */
    static async init(tileDefinitions) {
        for (let i = 0; i < tileDefinitions.length; i++) {
            const def = tileDefinitions[i];
            const ts = new TileSpec(i, def.name, def);
            this.tiles[i] = ts;
            this.tilesByName.set(def.name, ts);
        }
        for (let ts of this.tiles) {
            if (ts) ts.resolveReferences(this.tilesByName);
        }
    }

    static get(tileNumber) {
        return (tileNumber >= 0 && tileNumber < this.tiles.length) 
            ? this.tiles[tileNumber] 
            : null;
    }

    static load(tileName) {
        return this.tilesByName.get(tileName) || null;
    }

    static loadByOrdinal(tileNumber) {
        return Tiles.get(tileNumber);
    }

    static getTileCount() {
        return this.tiles.length;
    }
}