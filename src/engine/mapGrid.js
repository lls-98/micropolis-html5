/**
 * MapGrid handles all the memory grids for the city layout, 
 * including tiles, power, pollution, and crime data layers.
 */
export class MapGrid {
    constructor(width = 120, height = 100) {
        this.width = width;
        this.height = height;

        // --- Full Size Grids (120 x 100) ---
        // Uint16Array holds 16-bit numbers, perfectly replacing Java's char[][] map
        this.tiles = new Uint16Array(width * height);
        
        // Uint8Array holds bytes (0-255), replaces boolean[][] powerMap (0 = unpowered, 1 = powered)
        this.powerMap = new Uint8Array(width * height);

        // --- Half-Size Grids (60 x 50) ---
        // Micropolis tracks statistics in 2x2 block groups to save processing time
        this.halfW = Math.floor((width + 1) / 2);
        this.halfH = Math.floor((height + 1) / 2);
        const halfSize = this.halfW * this.halfH;

        this.landValueMem  = new Uint8Array(halfSize);
        this.pollutionMem  = new Uint8Array(halfSize);
        this.crimeMem      = new Uint8Array(halfSize);
        this.populationMem = new Uint8Array(halfSize);
        
        // Int8Array can hold negative numbers, which is needed for growth rates
        this.rateOGrowth   = new Int8Array(halfSize); 
    }

    /**
     * Checks if a coordinate is safely inside the map edges.
     * Replaces boolean testBounds(int x, int y)
     */
    testBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    /**
     * Retrieves a tile value from the grid.
     * Replaces int getTile(int x, int y)
     */
    getTile(x, y) {
        if (!this.testBounds(x, y)) {
            return 0; // Return blank/clear tile if out of bounds
        }
        const index = (y * this.width) + x;
        return this.tiles[index];
    }

    /**
     * Overwrites a tile value on the grid.
     * Replaces void putTile(int x, int y, int tile)
     */
    setTile(x, y, tileValue) {
        if (!this.testBounds(x, y)) return;
        const index = (y * this.width) + x;
        this.tiles[index] = tileValue;
    }
}