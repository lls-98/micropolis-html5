import { TrafficRules } from './trafficRules.js';

/**
 * TrafficGen implements the classic 1989 stateful random-walk pathfinding loop.
 * It traces commuters from their source zones to a valid destination tile.
 */
export class TrafficGen {
    /**
     * @param {object} city - The main Micropolis engine instance context
     */
    constructor(city) {
        this.city = city;
        this.mapX = 0;
        this.mapY = 0;
        this.sourceZone = null; // 'RESIDENTIAL', 'COMMERCIAL', or 'INDUSTRIAL'
        
        this.lastdir = 5;       // Restricts U-turns during active steps
        this.positions = [];    // Array stack storing tracked coordinates
    }

    /**
     * Main simulation trigger executed by the Map Scanner per zone activation cycle.
     * Ports makeTraffic() from TrafficGen.java.
     * @returns {number} 1 if trip succeeded, 0 if it hit a dead-end, -1 if no initial road access
     */
    makeTraffic(startX, startY, zoneType) {
        this.mapX = startX;
        this.mapY = startY;
        this.sourceZone = zoneType;

        // 1. Locate an initial roadway touching the outer perimeter of the zone
        if (this.findPerimeterRoad()) {
            // 2. Drive the random walk
            if (this.tryDrive()) {
                // 3. Flush the stack to apply traffic density values to the heatmap
                this.setTrafficMem();
                return 1;
            }
            return 0; // Trip failed due to poor planning or gridlock
        }
        return -1; // Isolated zone; no road connection found
    }

    /**
     * Scans the 12 coordinates around a zone to find an entry onto the transit grid.
     * Ports findPerimeterRoad() from TrafficGen.java.
     */
    findPerimeterRoad() {
        const TC = this.city.constants;
        for (let z = 0; z < 12; z++) {
            const tx = this.mapX + TrafficRules.PERIM_X[z];
            const ty = this.mapY + TrafficRules.PERIM_Y[z];

            if (this.roadTest(tx, ty, TC)) {
                this.mapX = tx;
                this.mapY = ty;
                return true;
            }
        }
        return false;
    }

    /**
     * Direct bridge mapping to the validation rules layer.
     */
    roadTest(x, y, TC) {
        if (!this.city.testBounds(x, y)) return false;
        const tile = this.city.getTile(x, y);
        return TrafficRules.isValidTransitTile(tile, TC);
    }

    /**
     * Drives the step sequence loop using available stamina cycles.
     * Ports tryDrive() from TrafficGen.java.
     */
    tryDrive() {
        this.lastdir = 5;
        this.positions = []; // Clear previous tracking stack
        
        let z = 0;
        while (z < TrafficRules.MAX_TRAFFIC_DISTANCE) {
            if (this.tryGo(z)) {
                // Step succeeded, check if we arrived next to a valid destination
                if (this.driveDone()) {
                    return true;
                }
                z++;
            } else {
                // Dead end reached! Backtrack to previous coordinate step
                if (this.positions.length > 0) {
                    const lastPos = this.positions.pop();
                    this.mapX = lastPos.x;
                    this.mapY = lastPos.y;
                    
                    // Impose a heavy surcharge penalty on stamina for backtracking
                    z += 3;
                } else {
                    return false; // Trapped with nowhere to go
                }
            }
        }
        return false; // Ran out of travel stamina before reaching a destination
    }

    /**
     * Selects a random direction and moves one cell forward if legal.
     * Ports tryGo() from TrafficGen.java.
     */
    tryGo(currentStep) {
        const TC = this.city.constants;
        // Generate a random index entry choice (0 to 3)
        const randomDir = Math.floor(Math.random() * 4);

        for (let d = randomDir; d < randomDir + 4; d++) {
            const realDir = d % 4;
            
            // Prevent immediate immediate backward reversing steps
            if (realDir === this.lastdir) continue;

            const targetX = this.mapX + TrafficRules.DX[realDir];
            const targetY = this.mapY + TrafficRules.DY[realDir];

            if (this.roadTest(targetX, targetY, TC)) {
                this.mapX = targetX;
                this.mapY = targetY;
                
                // Track our entry face vector to prevent backwards pivoting on the next step
                this.lastdir = (realDir + 2) % 4;

                // Memory saving optimization: only store coordinates every other move step
                if (currentStep % 2 === 1) {
                    this.positions.push({ x: this.mapX, y: this.mapY });
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Evaluates the 4 cardinal neighboring tiles to see if a valid destination has been reached.
     * Ports driveDone() from TrafficGen.java.
     */
    driveDone() {
        const TC = this.city.constants;
        const bounds = TrafficRules.getDestinationRange(this.sourceZone, TC);

        // Check North Neighbor
        if (this.mapY > 0) {
            const tile = this.city.getTile(this.mapX, this.mapY - 1);
            if (tile >= bounds.low && tile <= bounds.high) return true;
        }
        // Check East Neighbor
        if (this.mapX + 1 < this.city.getWidth()) {
            const tile = this.city.getTile(this.mapX + 1, this.mapY);
            if (tile >= bounds.low && tile <= bounds.high) return true;
        }
        // Check South Neighbor
        if (this.mapY + 1 < this.city.getHeight()) {
            const tile = this.city.getTile(this.mapX, this.mapY + 1);
            if (tile >= bounds.low && tile <= bounds.high) return true;
        }
        // Check West Neighbor
        if (this.mapX > 0) {
            const tile = this.city.getTile(this.mapX - 1, this.mapY);
            if (tile >= bounds.low && tile <= bounds.high) return true;
        }

        return false;
    }

    /**
     * Iterates through the history stack and adds traffic density values to valid road/rail tiles.
     * Ports setTrafficMem() from TrafficGen.java.
     */
    setTrafficMem() {
        const TC = this.city.constants;
        while (this.positions.length > 0) {
            const pos = this.positions.pop();
            
            if (this.city.testBounds(pos.x, pos.y)) {
                const tile = this.city.getTile(pos.x, pos.y);
                
                // Verify the tile is road/rail and not a power plant anchor or raw dirt
                if (tile >= TC.ROADBASE && tile < TC.POWERBASE) {
                    if (this.city.addTraffic) {
                        this.city.addTraffic(pos.x, pos.y, 50);
                    }
                }
            }
        }
    }
}