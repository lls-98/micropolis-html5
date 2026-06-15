import { TileBehavior } from './tile-behavior.js';
import { TileConstants } from './tileConstants.js';
import { SpriteKind } from './spriteKind.js';

/**
 * TerrainBehavior handles localized state changes for tiles during simulation update ticks.
 * Governs fires, floods, nuclear decay, road wear, traffic density, and draw-bridges.
 * Ports TerrainBehavior.java.
 */
export class TerrainBehavior extends TileBehavior {
    static TYPE_FIRE        = 'FIRE';
    static TYPE_FLOOD       = 'FLOOD';
    static TYPE_RADIOACTIVE = 'RADIOACTIVE';
    static TYPE_ROAD        = 'ROAD';
    static TYPE_RAIL        = 'RAIL';
    static TYPE_EXPLOSION   = 'EXPLOSION';

    static TRAFFIC_DENSITY_TAB = [
        TileConstants.ROADBASE,
        TileConstants.LTRFBASE,
        TileConstants.HTRFBASE
    ];

    /**
     * @param {object} city - Micropolis core engine context instance.
     * @param {string} behaviorType - One of the TYPE_* constants.
     */
    constructor(city, behaviorType) {
        super(city); // Calls the base TileBehavior constructor to bind city and PRNG
        this.behavior = behaviorType;
    }

    /**
     * Polymorphic implementation of the TileBehavior abstract contract.
     * Uses this.xpos, this.ypos, and this.tile evaluated statefully via processTile().
     */
    apply() {
        switch (this.behavior) {
            case TerrainBehavior.TYPE_FIRE:
                this.doFire();
                return;
            case TerrainBehavior.TYPE_FLOOD:
                this.doFlood();
                return;
            case TerrainBehavior.TYPE_RADIOACTIVE:
                this.doRadioactiveTile();
                return;
            case TerrainBehavior.TYPE_ROAD:
                this.doRoad();
                return;
            case TerrainBehavior.TYPE_RAIL:
                this.doRail();
                return;
            case TerrainBehavior.TYPE_EXPLOSION:
                this.doExplosion();
                return;
            default:
                throw new Error(`Unhandled terrain behavior signature type: ${this.behavior}`);
        }
    }

    /**
     * Spreads fire to neighbors and mitigates based on fire department coverage.
     */
    doFire() {
        this.city.firePop++;

        if (this.PRNG.nextInt(4) !== 0) {
            return;
        }

        const DX = [0, 1, 0, -1];
        const DY = [-1, 0, 1, 0];

        const tileUtils = this.city.tileUtils || {
            isCombustible: (t) => t > TileConstants.WOODS,
            isZoneCenter: (t) => (t % 16 === 0)
        };

        for (let dir = 0; dir < 4; dir++) {
            if (this.PRNG.nextInt(8) === 0) {
                const xtem = this.xpos + DX[dir];
                const ytem = this.ypos + DY[dir];

                if (!this.city.testBounds(xtem, ytem)) {
                    continue;
                }

                const c = this.city.getTile(xtem, ytem);
                if (tileUtils.isCombustible(c)) {
                    if (tileUtils.isZoneCenter(c)) {
                        this.city.killZone(xtem, ytem, c);
                        if (c > (TileConstants.IZB || 927)) {
                            this.city.makeExplosion(xtem, ytem);
                        }
                    }
                    this.city.setTile(xtem, ytem, TileConstants.FIRE);
                }
            }
        }

        const cov = this.city.getFireStationCoverage(this.xpos, this.ypos);
        const rate = cov > 100 ? 1 :
                     cov > 20  ? 2 :
                     cov !== 0 ? 3 : 10;

        if (this.PRNG.nextInt(rate + 1) === 0) {
            const rubbleOffset = TileConstants.RUBBLE + this.PRNG.nextInt(4);
            this.city.setTile(this.xpos, this.ypos, rubbleOffset);
        }
    }

    /**
     * Spreads water across maps during dynamic flood cycles.
     */
    doFlood() {
        const DX = [0, 1, 0, -1];
        const DY = [-1, 0, 1, 0];

        const tileUtils = this.city.tileUtils || {
            isCombustible: (t) => t > TileConstants.WOODS,
            isZoneCenter: (t) => (t % 16 === 0)
        };

        if (this.city.floodCnt !== 0) {
            for (let z = 0; z < 4; z++) {
                if (this.PRNG.nextInt(8) === 0) {
                    const xx = this.xpos + DX[z];
                    const yy = this.ypos + DY[z];

                    if (this.city.testBounds(xx, yy)) {
                        const t = this.city.getTile(xx, yy);
                        const isWoodsVary = (t >= TileConstants.WOODS5 && t < TileConstants.FLOOD);

                        if (tileUtils.isCombustible(t) || t === TileConstants.DIRT || isWoodsVary) {
                            if (tileUtils.isZoneCenter(t)) {
                                this.city.killZone(xx, yy, t);
                            }
                            const floodOffset = TileConstants.FLOOD + this.PRNG.nextInt(3);
                            this.city.setTile(xx, yy, floodOffset);
                        }
                    }
                }
            }
        } else {
            if (this.PRNG.nextInt(16) === 0) {
                this.city.setTile(this.xpos, this.ypos, TileConstants.DIRT);
            }
        }
    }

    /**
     * Manages slow environmental nuclear decay cleaning loops.
     */
    doRadioactiveTile() {
        if (this.PRNG.nextInt(4096) === 0) {
            this.city.setTile(this.xpos, this.ypos, TileConstants.DIRT);
        }
    }

    /**
     * Manages asset decay, traffic scaling shifts, and bridges.
     */
    doRoad() {
        this.city.roadTotal++;

        const tileUtils = this.city.tileUtils || {
            isConductive: (t) => false,
            isOverWater: (t) => t === TileConstants.RIVER,
            isCombustible: (t) => t > TileConstants.WOODS
        };

        if (this.city.roadEffect < 30) {
            if (this.PRNG.nextInt(512) === 0) {
                if (!tileUtils.isConductive(this.tile)) {
                    if (this.city.roadEffect < this.PRNG.nextInt(32)) {
                        if (tileUtils.isOverWater(this.tile)) {
                            this.city.setTile(this.xpos, this.ypos, TileConstants.RIVER);
                        } else {
                            const rubbleOffset = TileConstants.RUBBLE + this.PRNG.nextInt(4);
                            this.city.setTile(this.xpos, this.ypos, rubbleOffset);
                        }
                        return;
                    }
                }
            }
        }

        if (!tileUtils.isCombustible(this.tile)) {
            this.city.roadTotal += 4;
            if (this.doBridge()) {
                return;
            }
        }

        let tden;
        if (this.tile < TileConstants.LTRFBASE) {
            tden = 0;
        } else if (this.tile < TileConstants.HTRFBASE) {
            tden = 1;
        } else {
            this.city.roadTotal++;
            tden = 2;
        }

        const trafficDensity = this.city.getTrafficDensity(this.xpos, this.ypos);
        const newLevel = trafficDensity < 64 ? 0 : (trafficDensity < 192 ? 1 : 2);

        if (tden !== newLevel) {
            const z = ((this.tile - TileConstants.ROADBASE) & 15) + TerrainBehavior.TRAFFIC_DENSITY_TAB[newLevel];
            this.city.setTile(this.xpos, this.ypos, z);
        }
    }

    /**
     * Registers train spawn points and applies alignment degradation rules.
     */
    doRail() {
        this.city.railTotal++;
        this.city.generateTrain(this.xpos, this.ypos);

        const tileUtils = this.city.tileUtils || {
            isConductive: (t) => false,
            isOverWater: (t) => t === TileConstants.RIVER
        };

        if (this.city.roadEffect < 30) {
            if (this.PRNG.nextInt(512) === 0) {
                if (!tileUtils.isConductive(this.tile)) {
                    if (this.city.roadEffect < this.PRNG.nextInt(32)) {
                        if (tileUtils.isOverWater(this.tile)) {
                            this.city.setTile(this.xpos, this.ypos, TileConstants.RIVER);
                        } else {
                            const rubbleOffset = TileConstants.RUBBLE + this.PRNG.nextInt(4);
                            this.city.setTile(this.xpos, this.ypos, rubbleOffset);
                        }
                    }
                }
            }
        }
    }

    /**
     * Evaluates proximity thresholds to open and close regional draw-bridges.
     * @returns {boolean} True if the bridge is open.
     */
    doBridge() {
        const HDx = [-2, 2, -2, -1, 0, 1, 2];
        const HDy = [-1, -1, 0, 0, 0, 0, 0];
        const HBRTAB = [
            TileConstants.HBRDG1, TileConstants.HBRDG3,
            TileConstants.HBRDG0, TileConstants.RIVER,
            TileConstants.BRWH,   TileConstants.RIVER,
            TileConstants.HBRDG2
        ];
        const HBRTAB2 = [
            TileConstants.RIVER,   TileConstants.RIVER,
            TileConstants.HBRIDGE, TileConstants.HBRIDGE,
            TileConstants.HBRIDGE, TileConstants.HBRIDGE,
            TileConstants.HBRIDGE
        ];

        const VDx = [0, 1, 0, 0, 0, 0, 1];
        const VDy = [-2, -2, -1, 0, 1, 2, 2];
        const VBRTAB = [
            TileConstants.VBRDG0, TileConstants.VBRDG1,
            TileConstants.RIVER,  TileConstants.BRWV,
            TileConstants.RIVER,  TileConstants.VBRDG2,
            TileConstants.VBRDG3
        ];
        const VBRTAB2 = [
            TileConstants.VBRIDGE, TileConstants.RIVER,
            TileConstants.VBRIDGE, TileConstants.VBRIDGE,
            TileConstants.VBRIDGE, TileConstants.VBRIDGE,
            TileConstants.RIVER
        ];

        const boatDisMax = 340 / 16;
        const boatDisMin = 300 / 16;

        if (this.tile === TileConstants.BRWV) {
            if (this.PRNG.nextInt(4) === 0 && this.getBoatDis() > boatDisMax) {
                this.applyBridgeChange(VDx, VDy, VBRTAB, VBRTAB2);
            }
            return true;
        } else if (this.tile === TileConstants.BRWH) {
            if (this.PRNG.nextInt(4) === 0 && this.getBoatDis() > boatDisMax) {
                this.applyBridgeChange(HDx, HDy, HBRTAB, HBRTAB2);
            }
            return true;
        }

        if (this.getBoatDis() < boatDisMin && this.PRNG.nextInt(8) === 0) {
            if ((this.tile & 1) !== 0) {
                if (this.xpos < this.city.getWidth() - 1) {
                    if (this.city.getTile(this.xpos + 1, this.ypos) === TileConstants.CHANNEL) {
                        this.applyBridgeChange(VDx, VDy, VBRTAB2, VBRTAB);
                        return true;
                    }
                }
                return false;
            } else {
                if (this.ypos > 0) {
                    if (this.city.getTile(this.xpos, this.ypos - 1) === TileConstants.CHANNEL) {
                        this.applyBridgeChange(HDx, HDy, HBRTAB2, HBRTAB);
                        return true;
                    }
                }
                return false;
            }
        }

        return false;
    }

    /**
     * Shifts bridge grid cell elements.
     */
    applyBridgeChange(Dx, Dy, fromTab, toTab) {
        for (let z = 0; z < 7; z++) {
            const x = this.xpos + Dx[z];
            const y = this.ypos + Dy[z];
            if (this.city.testBounds(x, y)) {
                const currentTile = this.city.getTile(x, y);
                if (currentTile === fromTab[z] || currentTile === TileConstants.CHANNEL) {
                    this.city.setTile(x, y, toTab[z]);
                }
            }
        }
    }

    /**
     * Measures the absolute Manhattan distance between processing coordinates and cargo ships.
     * @returns {number} Distance score.
     */
    getBoatDis() {
        let dist = 99999;
        const activeSprites = this.city.sprites || [];
        
        for (let i = 0; i < activeSprites.length; i++) {
            const s = activeSprites[i];
            if (s.isVisible() && s.kind === SpriteKind.SHI) {
                const bx = Math.floor(s.x / 16);
                const by = Math.floor(s.y / 16);
                const d = Math.abs(this.xpos - bx) + Math.abs(this.ypos - by);
                dist = Math.min(d, dist);
            }
        }
        return dist;
    }

    /**
     * Reverts active explosion visual flashes to static rubble configurations.
     */
    doExplosion() {
        const rubbleOffset = TileConstants.RUBBLE + this.PRNG.nextInt(4);
        this.city.setTile(this.xpos, this.ypos, rubbleOffset);
    }
}