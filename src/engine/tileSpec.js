import { CityDimension } from './cityGeometry.js';

/**
 * TileSpec models individual tile traits, behaviors, and multi-tile structures.
 * Ports TileSpec.java.
 */
export class TileSpec {
    /**
     * @param {number} tileNumber - Explicit index integer identifier.
     * @param {string} tileName - String tag designation or string index value.
     */
    constructor(tileNumber, tileName) {
        this.tileNumber = tileNumber;
        this.name = tileName;

        this.animNext = null;
        this.onPower = null;
        this.onShutdown = null;

        this.canBulldoze = false;
        this.canBurn = true;
        this.canConduct = false;
        this.overWater = false;
        this.zone = false;

        this.owner = null;
        this.ownerOffsetX = 0;
        this.ownerOffsetY = 0;

        /** @type {BuildingInfo|null} */
        this.buildingInfo = null;

        /** @type {Map<string, string>} */
        this.attributes = new Map();
        /** @type {string[]} */
        this.images = [];
    }

    /**
     * Factory parsing loop to create fully initialized TileSpec configurations.
     * @param {number} tileNumber 
     * @param {string} tileName 
     * @param {string} inStr 
     * @param {Map<string, string>|object} recipes 
     * @returns {TileSpec}
     */
    static parse(tileNumber, tileName, inStr, recipes) {
        const ts = new TileSpec(tileNumber, tileName);
        ts.load(inStr, recipes);
        return ts;
    }

    getAttribute(key) {
        return this.attributes.get(key) || null;
    }

    getBooleanAttribute(key) {
        const v = this.getAttribute(key);
        return v !== null && v === 'true';
    }

    getBuildingInfo() {
        return this.buildingInfo;
    }

    getBuildingSize() {
        if (this.buildingInfo) {
            return new CityDimension(this.buildingInfo.width, this.buildingInfo.height);
        }
        return null;
    }

    getDescriptionNumber() {
        const v = this.getAttribute('description');
        if (v !== null && v.startsWith('#')) {
            return parseInt(v.substring(1), 10);
        }
        if (this.owner) {
            return this.owner.getDescriptionNumber();
        }
        return -1;
    }

    getImages() {
        return [...this.images];
    }

    getPollutionValue() {
        const v = this.getAttribute('pollution');
        if (v !== null) {
            return parseInt(v, 10);
        } else if (this.owner) {
            return this.owner.getPollutionValue();
        }
        return 0;
    }

    getPopulation() {
        const v = this.getAttribute('population');
        if (v !== null) {
            return parseInt(v, 10);
        }
        return 0;
    }

    isNumberedTile() {
        return /^\d+$/.test(this.name);
    }

    /**
     * Resolves sub-tile references and linking rules.
     * @param {Map<string, TileSpec>} tileMap 
     */
    resolveReferences(tileMap) {
        let tmp = this.getAttribute('becomes');
        if (tmp !== null) this.animNext = tileMap.get(tmp) || null;

        tmp = this.getAttribute('onpower');
        if (tmp !== null) this.onPower = tileMap.get(tmp) || null;

        tmp = this.getAttribute('onshutdown');
        if (tmp !== null) this.onShutdown = tileMap.get(tmp) || null;

        tmp = this.getAttribute('building-part');
        if (tmp !== null) this.handleBuildingPart(tmp, tileMap);

        this.resolveBuildingInfo(tileMap);
    }

    /**
     * Configures building sub-tiles linking back to their parent center.
     */
    handleBuildingPart(text, tileMap) {
        const parts = text.split(',');
        if (parts.length !== 3) {
            throw new Error('Invalid building-part specification format layout');
        }

        this.owner = tileMap.get(parts[0]) || null;
        this.ownerOffsetX = parseInt(parts[1], 10);
        this.ownerOffsetY = parseInt(parts[2], 10);

        if (!this.owner) {
            throw new Error(`Owner tile reference '${parts[0]}' not found in tile lookup map.`);
        }
    }

    /**
     * Aggregates member tiles for large, complex structures.
     */
    resolveBuildingInfo(tileMap) {
        const tmp = this.getAttribute('building');
        if (tmp === null) return;

        const p2 = tmp.split('x');
        const width = parseInt(p2[0], 10);
        const height = parseInt(p2[1], 10);
        const members = new Array(width * height);

        if (this.isNumberedTile()) {
            let startTile = parseInt(this.name, 10);
            if (width >= 3) startTile--;
            if (height >= 3) startTile -= width;

            for (let row = 0; row < height; row++) {
                for (let col = 0; col < width; col++) {
                    members[row * width + col] = tileMap.get(startTile.toString()) || null;
                    startTile++;
                }
            }
        } else {
            const mcol = width >= 3 ? -1 : 0;
            const mrow = height >= 3 ? -1 : 0;

            for (let row = 0; row < height; row++) {
                for (let col = 0; col < width; col++) {
                    const suffix = TileSpec.makeOffsetSuffix(col + mcol, row + mrow);
                    const n = this.name + suffix;
                    members[row * width + col] = tileMap.get(n) || null;
                }
            }
        }

        this.buildingInfo = { width, height, members };
    }

    /**
     * Generates cardinal suffix strings for sub-tiles.
     * @param {number} dx 
     * @param {number} dy 
     * @returns {string} Suffix string like '@N1E1' or empty string.
     */
    static makeOffsetSuffix(dx, dy) {
        if (dx === 0 && dy === 0) return '';

        const yStr = dy > 0 ? `S${dy}` : (dy < 0 ? `N${-dy}` : '');
        const xStr = dx > 0 ? `E${dx}` : (dx < 0 ? `W${-dx}` : '');

        return `@${yStr}${xStr}`;
    }

    /**
     * Interprets character configuration strings.
     * @param {string} inStr 
     * @param {Map<string, string>|object} recipes 
     */
    load(inStr, recipes) {
        const scanner = new TileSpecScanner(inStr);
        const recipeMap = recipes instanceof Map ? recipes : new Map(Object.entries(recipes || {}));

        while (scanner.hasMore()) {
            const peek = scanner.peekChar();

            if (peek === '(') {
                scanner.eatChar('(');
                const k = scanner.readAttributeKey();
                let v = 'true';

                if (scanner.peekChar() === '=') {
                    scanner.eatChar('=');
                    v = scanner.readAttributeValue();
                }
                scanner.eatChar(')');

                if (!this.attributes.has(k)) {
                    this.attributes.set(k, v);
                    const supplementarySpec = recipeMap.get(k);
                    if (supplementarySpec) {
                        this.load(supplementarySpec, recipes);
                    }
                } else {
                    this.attributes.set(k, v);
                }
            } else if (peek === '|' || peek === ',') {
                scanner.eatChar(peek);
            } else {
                const img = scanner.readImageSpec();
                if (img) {
                    this.images.push(img);
                }
            }
        }

        this.canBulldoze = this.getBooleanAttribute('bulldozable');
        this.canBurn = !this.getBooleanAttribute('noburn');
        this.canConduct = this.getBooleanAttribute('conducts');
        this.overWater = this.getBooleanAttribute('overwater');
        this.zone = this.getBooleanAttribute('zone');
    }

    /**
     * Sorts structural array registries containing text descriptors and numerical indicators.
     * @param {object|Map<string, string>} recipe 
     * @returns {string[]}
     */
    static generateTileNames(recipe) {
        const hasKey = (k) => recipe instanceof Map ? recipe.has(k) : Object.prototype.hasOwnProperty.call(recipe, k);
        const getKeys = () => recipe instanceof Map ? Array.from(recipe.keys()) : Object.keys(recipe);

        const keysList = getKeys();
        const tileNames = new Array(keysList.length);
        let ntiles = 0;

        for (let i = 0; hasKey(i.toString()); i++) {
            tileNames[ntiles++] = i.toString();
        }
        const naturalNumberTiles = ntiles;

        for (let key of keysList) {
            if (/^\d+$/.test(key)) {
                const x = parseInt(key, 10);
                if (x >= 0 && x < naturalNumberTiles) {
                    continue;
                }
            }
            tileNames[ntiles++] = key;
        }

        return tileNames;
    }

    toString() {
        return `{tile:${this.name}}`;
    }
}

/**
 * Text parsing utility.
 */
class TileSpecScanner {
    constructor(str) {
        this.str = str;
        this.off = 0;
    }

    skipWhitespace() {
        while (this.off < this.str.length && /\s/.test(this.str.charAt(this.off))) {
            this.off++;
        }
    }

    peekChar() {
        this.skipWhitespace();
        if (this.off < this.str.length) {
            return this.str.charAt(this.off);
        }
        return null;
    }

    eatChar(ch) {
        this.skipWhitespace();
        if (this.str.charAt(this.off) !== ch) {
            throw new Error(`Token mismatch error code. Expected '${ch}', found '${this.str.charAt(this.off)}'`);
        }
        this.off++;
    }

    readAttributeKey() {
        this.skipWhitespace();
        const start = this.off;

        while (this.off < this.str.length) {
            const char = this.str.charAt(this.off);
            if (char === '-' || /[a-zA-Z0-9]/.test(char)) {
                this.off++;
            } else {
                break;
            }
        }

        return this.off !== start ? this.str.substring(start, this.off) : null;
    }

    readAttributeValue() {
        return this.readString();
    }

    readImageSpec() {
        return this.readString();
    }

    readString() {
        this.skipWhitespace();
        let endQuote = null;

        if (this.peekChar() === '"') {
            this.off++;
            endQuote = '"';
        }

        const start = this.off;
        while (this.off < this.str.length) {
            const c = this.str.charAt(this.off);
            if (c === endQuote) {
                const end = this.off;
                this.off++;
                return this.str.substring(start, end);
            } else if (endQuote === null && (/\s/.test(c) || c === ')' || c === '|')) {
                return this.str.substring(start, this.off);
            }
            this.off++;
        }
        return this.str.substring(start);
    }

    hasMore() {
        return this.peekChar() !== null;
    }
}