import { MapGeneratorData } from './mapGeneratorData.js';

/**
 * MapGenerator manages procedural terrain generation, river carving,
 * coastal island modeling, and forestry simulation. Ports MapGenerator.java.
 */
export class MapGenerator {
    /**
     * @param {object} engine - Reference to the parent Micropolis engine framework instance
     */
    constructor(engine) {
        if (!engine) {
            throw new Error("MapGenerator requires a valid engine context initialization reference.");
        }
        this.engine = engine;
        this.map = engine.map;

        this.createIsland = MapGeneratorData.CREATE_ISLAND.SELDOM;
        
        this.treeLevel = -1;
        this.curveLevel = -1;
        this.lakeLevel = -1;

        // Generator walking cursors
        this.xStart = 0;
        this.yStart = 0;
        this.mapX = 0;
        this.mapY = 0;
        this.dir = 0;
        this.lastDir = 0;

        // Localized PRNG placeholder
        this.PRNG = null;
    }

    getWidth() { return this.map[0].length; }
    getHeight() { return this.map.length; }

    /**
     * Generates a completely new city layout map using a fresh seed.
     */
    generateNewCity() {
        const seed = Math.floor(Math.random() * 999999999);
        this.generateSomeCity(seed);
    }

    /**
     * Generates a city map based on an explicit target generation seed.
     */
    generateSomeCity(seed) {
        this.generateMap(seed);
        if (this.engine.fireWholeMapChanged) {
            this.engine.fireWholeMapChanged();
        }
    }

    /**
     * Primary procedural map generation pipeline execution script.
     */
    generateMap(seed) {
        // Initialize basic linear seed tracking helpers
        this.PRNG = this.createRandomGenerator(seed);
        const MD = MapGeneratorData;

        if (this.createIsland === MD.CREATE_ISLAND.SELDOM) {
            if (this.nextInt(100) < 10) {
                this.makeIsland();
                return;
            }
        }

        if (this.createIsland === MD.CREATE_ISLAND.ALWAYS) {
            this.makeNakedIsland();
        } else {
            this.clearMap();
        }

        this.getRandStart();

        if (this.curveLevel !== 0) {
            this.doRivers();
        }

        if (this.lakeLevel !== 0) {
            this.makeLakes();
        }

        this.smoothRiver();

        if (this.treeLevel !== 0) {
            this.doTrees();
        }
    }

    makeIsland() {
        this.makeNakedIsland();
        this.smoothRiver();
        this.doTrees();
    }

    erand(limit) {
        return Math.min(this.nextInt(limit), this.nextInt(limit));
    }

    makeNakedIsland() {
        const MD = MapGeneratorData;
        const TC = this.engine.constants;
        const width = this.getWidth();
        const height = this.getHeight();

        // Flood the entire world grid with water
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                this.map[y][x] = TC.RIVER;
            }
        }

        // Carve an inland rectangular frame of dirt
        for (let y = 5; y < height - 5; y++) {
            for (let x = 5; x < width - 5; x++) {
                this.map[y][x] = TC.DIRT;
            }
        }

        // Erode horizontal boundaries into smooth coastlines
        for (let x = 0; x < width - 5; x += 2) {
            this.mapX = x;
            this.mapY = this.erand(MD.ISLAND_RADIUS + 1);
            this.BRivPlop();
            this.mapY = (height - 10) - this.erand(MD.ISLAND_RADIUS + 1);
            this.BRivPlop();
            this.mapY = 0;
            this.SRivPlop();
            this.mapY = height - 6;
            this.SRivPlop();
        }

        // Erode vertical boundaries into smooth coastlines
        for (let y = 0; y < height - 5; y += 2) {
            this.mapY = y;
            this.mapX = this.erand(MD.ISLAND_RADIUS + 1);
            this.BRivPlop();
            this.mapX = (width - 10) - this.erand(MD.ISLAND_RADIUS + 1);
            this.BRivPlop();
            this.mapX = 0;
            this.SRivPlop();
            this.mapX = width - 6;
            this.SRivPlop();
        }
    }

    clearMap() {
        const TC = this.engine.constants;
        for (let y = 0; y < this.map.length; y++) {
            this.map[y].fill(TC.DIRT);
        }
    }

    getRandStart() {
        this.xStart = 40 + this.nextInt(this.getWidth() - 79);
        this.yStart = 33 + this.nextInt(this.getHeight() - 66);
        this.mapX = this.xStart;
        this.mapY = this.yStart;
    }

    makeLakes() {
        let iterations = this.lakeLevel < 0 ? this.nextInt(11) : Math.floor(this.lakeLevel / 2);

        for (let t = 0; t < iterations; t++) {
            let x = this.nextInt(this.getWidth() - 20) + 10;
            let y = this.nextInt(this.getHeight() - 19) + 10;
            let clusters = this.nextInt(13) + 2;

            for (let z = 0; z < clusters; z++) {
                this.mapX = x - 6 + this.nextInt(13);
                this.mapY = y - 6 + this.nextInt(13);

                if (this.nextInt(5) !== 0) {
                    this.SRivPlop();
                } else {
                    this.BRivPlop();
                }
            }
        }
    }

    doRivers() {
        this.dir = this.lastDir = this.nextInt(4);
        this.doBRiv();

        this.mapX = this.xStart;
        this.mapY = this.yStart;
        this.dir = this.lastDir = this.lastDir ^ 4;
        this.doBRiv();

        this.mapX = this.xStart;
        this.mapY = this.yStart;
        this.lastDir = this.nextInt(4);
        this.doSRiv();
    }

    doBRiv() {
        let r1 = this.curveLevel < 0 ? 100 : this.curveLevel + 10;
        let r2 = this.curveLevel < 0 ? 200 : this.curveLevel + 100;

        while (this.engine.testBounds(this.mapX + 4, this.mapY + 4)) {
            this.BRivPlop();
            if (this.nextInt(r1 + 1) < 10) {
                this.dir = this.lastDir;
            } else {
                if (this.nextInt(r2 + 1) > 90) this.dir++;
                if (this.nextInt(r2 + 1) > 90) this.dir--;
            }
            this.moveMap(this.dir);
        }
    }

    doSRiv() {
        let r1 = this.curveLevel < 0 ? 100 : this.curveLevel + 10;
        let r2 = this.curveLevel < 0 ? 200 : this.curveLevel + 100;

        while (this.engine.testBounds(this.mapX + 3, this.mapY + 3)) {
            this.SRivPlop();
            if (this.nextInt(r1 + 1) < 10) {
                this.dir = this.lastDir;
            } else {
                if (this.nextInt(r2 + 1) > 90) this.dir++;
                if (this.nextInt(r2 + 1) > 90) this.dir--;
            }
            this.moveMap(this.dir);
        }
    }

    BRivPlop() {
        const matrix = MapGeneratorData.BR_MATRIX;
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                this.putOnMap(matrix[y][x], x, y);
            }
        }
    }

    SRivPlop() {
        const matrix = MapGeneratorData.SR_MATRIX;
        for (let x = 0; x < 6; x++) {
            for (let y = 0; y < 6; y++) {
                this.putOnMap(matrix[y][x], x, y);
            }
        }
    }

    putOnMap(mapChar, xoff, yoff) {
        if (mapChar === 0) return;

        const xloc = this.mapX + xoff;
        const yloc = this.mapY + yoff;

        if (!this.engine.testBounds(xloc, yloc)) return;

        const TC = this.engine.constants;
        let tmp = this.map[yloc][xloc];

        if (tmp !== TC.DIRT) {
            tmp = tmp & TC.LOMASK;
            if (tmp === TC.RIVER && mapChar !== TC.CHANNEL) return;
            if (tmp === TC.CHANNEL) return;
        }
        this.map[yloc][xloc] = mapChar;
    }

    smoothRiver() {
        const MD = MapGeneratorData;
        const TC = this.engine.constants;

        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] === TC.REDGE) {
                    let bitindex = 0;

                    for (let z = 0; z < 4; z++) {
                        bitindex <<= 1;
                        const xtem = x + MD.DX[z];
                        const ytem = y + MD.DY[z];
                        
                        if (this.engine.testBounds(xtem, ytem)) {
                            const neighbor = this.map[ytem][xtem] & TC.LOMASK;
                            if (neighbor !== TC.DIRT && (neighbor < TC.WOODS_LOW || neighbor > TC.WOODS_HIGH)) {
                                bitindex |= 1;
                            }
                        }
                    }

                    let temp = MD.R_ED_TAB[bitindex & 15];
                    if (temp !== TC.RIVER && this.nextInt(2) !== 0) {
                        temp++;
                    }
                    this.map[y][x] = temp;
                }
            }
        }
    }

    doTrees() {
        let amount = this.treeLevel < 0 ? this.nextInt(101) + 50 : this.treeLevel + 3;

        for (let x = 0; x < amount; x++) {
            let xloc = this.nextInt(this.getWidth());
            let yloc = this.nextInt(this.getHeight());
            this.treeSplash(xloc, yloc);
        }

        this.smoothTrees();
        this.smoothTrees();
    }

    treeSplash(xloc, yloc) {
        let dis = this.treeLevel < 0 ? this.nextInt(151) + 50 : this.nextInt(101 + (this.treeLevel * 2)) + 50;

        this.mapX = xloc;
        this.mapY = yloc;

        const TC = this.engine.constants;

        for (let z = 0; z < dis; z++) {
            let direction = this.nextInt(8);
            this.moveMap(direction);

            if (!this.engine.testBounds(this.mapX, this.mapY)) return;

            if ((this.map[this.mapY][this.mapX] & TC.LOMASK) === TC.DIRT) {
                this.map[this.mapY][this.mapX] = TC.WOODS;
            }
        }
    }

    moveMap(direction) {
        const MD = MapGeneratorData;
        direction = direction & 7;
        this.mapX += MD.DIRECTION_TABX[direction];
        this.mapY += MD.DIRECTION_TABY[direction];
    }

    smoothTrees() {
        const MD = MapGeneratorData;
        const TC = this.engine.constants;
        const isTreeCheck = this.engine.isTree || ((t) => t >= TC.WOODS_LOW && t <= TC.WOODS_HIGH);

        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (isTreeCheck(this.map[y][x])) {
                    let bitindex = 0;
                    for (let z = 0; z < 4; z++) {
                        bitindex <<= 1;
                        const xtem = x + MD.DX[z];
                        const ytem = y + MD.DY[z];
                        if (this.engine.testBounds(xtem, ytem) && isTreeCheck(this.map[ytem][xtem])) {
                            bitindex |= 1;
                        }
                    }
                    
                    let temp = MD.T_ED_TAB[bitindex & 15];
                    if (temp !== 0) {
                        if (temp !== TC.WOODS && ((x + y) & 1) !== 0) {
                            temp -= 8;
                        }
                        this.map[y][x] = temp;
                    } else {
                        this.map[y][x] = temp;
                    }
                }
            }
        }
    }

    /**
     * Replaces Java's java.util.Random using a simple, predictable seedable LCG structure.
     */
    createRandomGenerator(seed) {
        let currentSeed = seed;
        return () => {
            // Standard POSIX parameter multipliers
            currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
            return currentSeed / 0x7fffffff;
        };
    }

    nextInt(limit) {
        if (!this.PRNG) return Math.floor(Math.random() * limit);
        return Math.floor(this.PRNG() * limit);
    }
}