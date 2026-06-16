import { Micropolis } from './engine/micropolis.js';
import { ToolStroke } from './engine/toolStroke.js';
import { MicropolisTool } from './engine/micropolisTool.js';
import { SpriteKind } from './engine/spriteKind.js';
import { TrainSprite } from './engine/trainSprite.js';
import { TornadoSprite } from './engine/tornadoSprite.js';
import { Tiles } from './engine/tiles.js';

/**
 * Minimal static recipe definitions mirroring your game's layout profiles.
 * This satisfies Tiles.java/TileSpec.java string scanner parser rules.
 */
const TILES_CONFIG_RECIPE = {
    "0": "(bulldozable=false) (noburn=true) dirt",
    "RESCLR": "(zone=true) (building=3x3) residential_clear",
    "1": "res_sub_0", "2": "res_sub_1", "3": "res_sub_2",
    "4": "res_sub_3", "5": "res_sub_4", "6": "res_sub_5",
    "7": "res_sub_6", "8": "res_sub_7", "9": "res_sub_8",
    "RAILBASE": "(conducts=true) straight_rail",
    "RAILVPOWERH": "(conducts=true) rail_power_intersection"
};

function bootstrapSimulationEngine() {
    console.log("⚙️ [MicropolisEngine] Initializing simulation registries...");
    
    try {
        // 1. Initialize static database spec lookup maps
        Tiles.initialize(TILES_CONFIG_RECIPE);
        
        // 2. Instantiate a default city map layout context (e.g., 120 columns x 100 rows)
        const city = new Micropolis(120, 100);
        console.log(`🎮 [Engine Status] Active City Map Grid generated (${city.getWidth()}x${city.getHeight()})`);
        console.log(`💰 [Engine Status] Starting treasury configuration: §${city.budget.totalFunds}`);

        // 3. Perform a diagnostic test: Stamp a residential zone down via ToolStroke
        console.log("🏗️ [Engine Status] Validating tool transaction processing logic...");
        const residentialZoneStroke = new ToolStroke(city, MicropolisTool.RESIDENTIAL, 10, 10);
        const transactionResult = residentialZoneStroke.apply();
        console.log(`📊 [Engine Status] Zone Placement Result: ${transactionResult}`);
        console.log(`📉 [Engine Status] Treasury remaining: §${city.budget.totalFunds}`);

        // 4. Inject a couple of entity agent behaviors to ensure loops run smoothly
        console.log("🚂 [Engine Status] Spawning dynamic tracking agents...");
        const testTrain = new TrainSprite(city, 10, 12);
        const testTornado = new TornadoSprite(city, 20, 20);
        city.sprites.push(testTrain);
        city.sprites.push(testTornado);

        // 5. Run a simulation loop cycle to verify the state machine ticks without crashes
        city.simulateStep();
        console.log(`🔄 [Engine Status] Baseline engine cycle successfully executed. Game clock cycle: ${city.acycle}`);

        // 6. Bind instance to the global window object for real-time sandbox debugging in your browser console
        window.currentCityInstance = city;
        window.MicropolisTool = MicropolisTool;
        window.ToolStroke = ToolStroke;
        
        console.log("🚀 [MicropolisEngine] Simulation engine is fully running alongside the live development environment!");
        console.log("💡 Tip: Type 'window.currentCityInstance' in your browser console to inspect or modify the active live city grid state!");

    } catch (error) {
        console.error("❌ [MicropolisEngine] Critical error occurred during engine runtime startup:", error);
    }
}

// Kick off engine initialization as soon as the DOM finishes setting up
document.addEventListener("DOMContentLoaded", bootstrapSimulationEngine);