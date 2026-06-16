import { TileSpec } from './tileSpec.js';

/**
 * Tiles registry acts as a singleton container for all tile definitions.
 * Parses the classic MicropolisJ .rc asset text database dynamically.
 */
export class Tiles {
    static tiles = [];
    static tilesByName = new Map();

    /**
     * Dynamically downloads and parses the master tiles.rc configuration layout sheet.
     * Replaces the old temporary manual recipe initializer.
     * @param {string} rcUrl - Relative path to the asset file (e.g. 'assets/tiles.rc')
     */
    static async initializeFromRc(rcUrl = 'assets/tiles.rc') {
        try {
            const response = await fetch(rcUrl);
            if (!response.ok) throw new Error(`Could not locate tile database at ${rcUrl}`);
            
            const text = await response.text();
            const lines = text.split(/\r?\n/);
            const tileDefinitions = [];

            // Match Line Syntax: ID    image_sheet@x,y|ani_sheet@x,y   (flags)
            // Example: 924 coal@32,16|coal_smoke_animation@32,16 (conducts)(building-part=750,1,0)
            const lineRegex = /^(\d+)\s+([^(\s]+)(.*)$/;

            for (let line of lines) {
                line = line.trim();
                // Omit documentation notes, blank lines or comments
                if (!line || line.startsWith('#')) continue;

                const match = line.match(lineRegex);
                if (!match) continue;

                const tileId = parseInt(match[1], 10);
                const sourceTextures = match[2]; // e.g. "coal@32,16|coal_smoke_animation@32,16"
                const rawFlags = match[3] || ""; // e.g. "(conducts)(building-part=750,1,0)"

                // Split static texture definition from animation overlay sequences
                const textureParts = sourceTextures.split('|');
                const staticPart = textureParts[0]; // "coal@32,16"
                const animationPart = textureParts[1] || null; // "coal_smoke_animation@32,16"

                // Extract image asset sheet name and pixel clipping coordinates
                const [imageSheet, coordString] = staticPart.split('@');
                let sourceX = 0, sourceY = 0;
                if (coordString) {
                    const [sx, sy] = coordString.split(',').map(Number);
                    sourceX = sx;
                    sourceY = sy;
                }

                // Compile definition object structured for TileSpec consumption
                const definition = {
                    id: tileId,
                    name: `${imageSheet}_tile_${tileId}`, // Unique reference string fallback
                    imageSheet: imageSheet,              // Matches file descriptors (e.g. 'coal', 'terrain')
                    sourceX: sourceX,                    // Clipping X origin on the image sheet
                    sourceY: sourceY,                    // Clipping Y origin on the image sheet
                    rawFlags: rawFlags,                  // Unparsed string containing flag properties
                    animated: !!animationPart,
                    animationSheet: animationPart ? animationPart.split('@')[0] : null
                };

                tileDefinitions[tileId] = definition;
            }

            // Standardize density allocations to match array sizes smoothly
            await this.init(tileDefinitions.filter(Boolean));
            console.log(`💾 [Tiles Database] Successfully registered ${this.tiles.length} active tile specifications from tiles.rc!`);

        } catch (error) {
            console.error("❌ Failed to parse tiles database script configurations:", error);
            throw error;
        }
    }

    /**
     * Initializes the registry by turning raw definitions into full TileSpecs.
     */
    static async init(tileDefinitions) {
        // Clear previous runs to allow clean warm resets
        this.tiles = [];
        this.tilesByName.clear();

        // Convert array of definition objects into TileSpec instances
        for (let i = 0; i < tileDefinitions.length; i++) {
            const def = tileDefinitions[i];
            if (!def) continue;

            const ts = new TileSpec(def.id, def.name, def);
            this.tiles[def.id] = ts;
            this.tilesByName.set(def.name, ts);
        }

        // Resolve cross-references (building members, adjacency paths, shut downs)
        for (let ts of this.tiles) {
            if (ts && typeof ts.resolveReferences === 'function') {
                ts.resolveReferences(this.tilesByName);
            }
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
        return this.get(tileNumber);
    }

    static getTileCount() {
        return this.tiles.length;
    }
}