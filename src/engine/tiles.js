import { TileSpec } from './tile-spec.js';

/**
 * Tiles registry acts as a singleton container for all tile definitions.
 */
export class Tiles {
    static tiles = [];
    static tilesByName = new Map();

    /**
     * Initializes the registry by loading data.
     * In a browser/web environment, this would be an async fetch.
     */
    static async init(tileDefinitions) {
        // Convert array of definition objects into TileSpec instances
        for (let i = 0; i < tileDefinitions.length; i++) {
            const def = tileDefinitions[i];
            const ts = new TileSpec(i, def.name, def);
            this.tiles[i] = ts;
            this.tilesByName.set(def.name, ts);
        }

        // Resolve cross-references (building members, etc.)
        for (let ts of this.tiles) {
            ts.resolveReferences(this.tilesByName);
        }
    }

    static get(tileNumber) {
        return (tileNumber >= 0 && tileNumber < this.tiles.length) 
            ? this.tiles[tileNumber] 
            : null;
    }

    static load(tileName) {
        return this.tilesByName.get(tileName);
    }
}