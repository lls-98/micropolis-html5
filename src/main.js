import { Micropolis } from './engine/micropolis.js';
import { ToolStroke } from './engine/toolStroke.js';
import { MicropolisTool } from './engine/micropolisTool.js';
import { SpriteKind } from './engine/spriteKind.js';
import { TrainSprite } from './engine/trainSprite.js';
import { TornadoSprite } from './engine/tornadoSprite.js';
import { Tiles } from './engine/tiles.js';
import { assets } from './view/assetLoader.js';

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

// 🟢 Fixed: Added 'async' so that 'await' can be evaluated inside the function scope
async function bootstrapSimulationEngine() {
    console.log("⚙️ [MicropolisEngine] Initializing simulation registries...");
    
    try {
        console.log("📦 Loading discrete asset maps and audio clips...");

        // 1. Build a map of your audio clips
        const soundManifest = {
            'bop': 'public/assets/sounds/bop.wav',
            'explosion-high': 'public/assets/sounds/explosion-high.wav',
            'explosion-low': 'public/assets/sounds/explosion-low.wav',
            'heavytraffic': 'public/assets/sounds/heavytraffic.wav',
            'honkhonk-high': 'public/assets/sounds/honkhonk-high.wav',
            'honkhonk-hi': 'public/assets/sounds/honkhonk-hi.wav',
            'honkhonk-low': 'public/assets/sounds/honkhonk-low.wav',
            'honkhonk-med': 'public/assets/sounds/honkhonk-med.wav',
            'layzone': 'public/assets/sounds/layzone.wav',
            'monster': 'public/assets/sounds/monster.wav',
            'siren': 'public/assets/sounds/siren.wav',
            'sorry': 'public/assets/sounds/sorry.wav',
            'uhuh': 'public/assets/sounds/uhuh.wav',
            'zombie-roar': 'public/assets/sounds/zombie-roar-5.wav'
        };

        // 2. Build a map of the core structural sprite layers we'll render first
        const imageManifest = {
            // Core Terrain, Network Utilities and Base Zones
            'terrain': 'public/assets/images/terrain.png',
            'roads': 'public/assets/images/roads.png',
            'rails': 'public/assets/images/rails.png',
            'wires': 'public/assets/images/wires.png',
            'roadwire': 'public/assets/images/roadwire.png',
            'res_zones': 'public/assets/images/res_zones.png',
            'com_zones': 'public/assets/images/com_zones.png',
            'ind_zones': 'public/assets/images/ind_zones.png',
            
            // Major City Service footprint structures
            'fire': 'public/assets/images/fire.png',
            'firestation': 'public/assets/images/firestation.png',
            'police': 'public/assets/images/police.png',
            'seaport': 'public/assets/images/seaport.png',
            'stadium': 'public/assets/images/stadium.png',
            'coal': 'public/assets/images/coal.png',
            'nuclear': 'public/assets/images/nuclear.png',
            'airport': 'public/assets/images/airport.png',
            
            // UI Overlay graphs and icons for our toolbar selection
            'demandg': 'public/assets/images/demandg.png',
            'icroad': 'public/assets/images/icroad.png',
            'icroadhi': 'public/assets/images/icroadhi.png',
            'icres': 'public/assets/images/icres.png',
            'icreshi': 'public/assets/images/icreshi.png'
            // (You can append more icon files here as you construct the view panel options)
        };

        // Run the automated batch download promises concurrently
        await Promise.all([
            assets.loadImages(imageManifest),
            assets.loadSounds(soundManifest)
        ]);
        
        console.log("🎨 Media assets successfully loaded into runtime memory!");

    } catch (error) {
        console.error("❌ Critical error during asset preloading:", error);
        return;
    }

    try {
        // 2. Initialize static database spec lookup maps
        console.log("📖 Parsing tile database attributes registry...");
        await Tiles.initializeFromRc('public/assets/tiles.rc');
        
        // 3. Instantiate a default city map layout context (e.g., 120 columns x 100 rows)
        const city = new Micropolis(120, 100);
        console.log(`🎮 [Engine Status] Active City Map Grid generated (${city.getWidth()}x${city.getHeight()})`);
        console.log(`💰 [Engine Status] Starting treasury configuration: §${city.budget.totalFunds}`);

        // 4. Perform a diagnostic test: Stamp a residential zone down via ToolStroke
        console.log("🏗️ [Engine Status] Validating tool transaction processing logic...");
        const residentialZoneStroke = new ToolStroke(city, MicropolisTool.RESIDENTIAL, 10, 10);
        const transactionResult = residentialZoneStroke.apply();
        console.log(`📊 [Engine Status] Zone Placement Result: ${transactionResult}`);
        console.log(`📉 [Engine Status] Treasury remaining: §${city.budget.totalFunds}`);

        // 5. Inject a couple of entity agent behaviors to ensure loops run smoothly
        console.log("🚂 [Engine Status] Spawning dynamic tracking agents...");
        const testTrain = new TrainSprite(city, 10, 12);
        const testTornado = new TornadoSprite(city, 20, 20);
        city.sprites.push(testTrain);
        city.sprites.push(testTornado);

        // 6. Run a simulation loop cycle to verify the state machine ticks without crashes
        city.simulateStep();
        console.log(`🔄 [Engine Status] Baseline engine cycle successfully executed. Game clock cycle: ${city.acycle}`);

        // 7. Bind instance to the global window object for real-time sandbox debugging in your browser console
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