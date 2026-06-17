import { Micropolis } from './engine/micropolis.js';
import { ToolStroke } from './engine/toolStroke.js';
import { MicropolisTool } from './engine/micropolisTool.js';
import { TrainSprite } from './engine/trainSprite.js';
import { TornadoSprite } from './engine/tornadoSprite.js';
import { Tiles } from './engine/tiles.js';
import { assets } from './view/assetLoader.js';
import { MapRenderer } from './view/mapRenderer.js';
import { InputHandler } from './view/inputHandler.js';
import { GameLoop } from './view/gameLoop.js';
import { Toolbar } from './view/toolbar.js';

async function bootstrapSimulationEngine() {
    console.log("🚀 [MicropolisEngine] Bootstrapping simulation pipeline...");
    
    let city;
    let renderer;
    let inputController;
    let loopManager;

    // Phase 1: Initialize Core Simulation Logic (Network Independent)
    try {
        console.log("📖 Initializing layout tile definitions database...");
        
        await Tiles.initializeFromRc('assets/tiles.rc').catch(err => {
            console.warn("⚠️ Could not load tiles.rc dynamically. Falling back to internal defaults.", err);
            Tiles.tiles = new Array(1000).fill(null).map((_, i) => ({
                id: i, name: `tile_${i}`, imageSheet: 'terrain', sourceX: 0, sourceY: 0
            }));
            Tiles.get = (id) => Tiles.tiles[id] || { id: 0, imageSheet: 'terrain', sourceX: 0, sourceY: 0 };
        });

        // Generate the core city tracking landscape matrix map
        city = new Micropolis(120, 100);
        console.log(`🎮 [Engine Status] Active Grid Canvas generated (${city.getWidth()}x${city.getHeight()})`);
        
        // ===================================================================
        // 🟢 GLOBAL TILE CONSTANTS NETWORK CONNECTIVITY AUTOPATCH
        // ===================================================================
        window.TileConstants = window.TileConstants || {};
        
        // Boundaries
        window.TileConstants.isRoadDynamic = (id) => id >= 64 && id <= 205;
        window.TileConstants.isRailDynamic = (id) => id >= 206 && id <= 238;

        // Adjacency Evaluation Fallbacks (returns true if neighboring tile matches type)
        window.TileConstants.roadConnectsSouth = (id) => window.TileConstants.isRoadDynamic(id);
        window.TileConstants.roadConnectsWest  = (id) => window.TileConstants.isRoadDynamic(id);
        window.TileConstants.roadConnectsNorth = (id) => window.TileConstants.isRoadDynamic(id);
        window.TileConstants.roadConnectsEast  = (id) => window.TileConstants.isRoadDynamic(id);

        window.TileConstants.railConnectsSouth = (id) => window.TileConstants.isRailDynamic(id);
        window.TileConstants.railConnectsWest  = (id) => window.TileConstants.isRailDynamic(id);
        window.TileConstants.railConnectsNorth = (id) => window.TileConstants.isRailDynamic(id);
        window.TileConstants.railConnectsEast  = (id) => window.TileConstants.isRailDynamic(id);

        // Basic Tile Lookups Tables (Fills a flat fallback translation matrix)
        window.TileConstants.RoadTable = new Array(16).fill(76); // Default crossing tile index fallback
        window.TileConstants.RailTable = new Array(16).fill(211);
        // ===================================================================

        // UNPAUSE ENGINE CORE
        if (typeof city.setSpeed === 'function') {
            city.setSpeed(1);
        } else {
            city.simSpeed = 1;
        }
        city.isPaused = false;
        city.gamePaused = false;

        console.log(`💰 [Engine Status] Starting treasury configuration: §${city.budget?.totalFunds ?? 20000}`);

        // Perform a diagnostic zone placement stroke test
        console.log("🏗️ [Engine Status] Validating tool transaction processing mechanics...");
        const residentialZoneStroke = new ToolStroke(city, MicropolisTool.RESIDENTIAL, 10, 10);
        residentialZoneStroke.apply();
        console.log(`📉 [Engine Status] Treasury remaining: §${city.budget?.totalFunds ?? 20000}`);

        // Inject pathfinding tracking entity loops
        console.log("🚂 [Engine Status] Spawning dynamic tracking agents...");
        city.sprites.push(new TrainSprite(city, 10, 12));
        city.sprites.push(new TornadoSprite(city, 20, 20));

        // Step the time clock matrix forward once for verification
        city.simulateStep();
        console.log(`🔄 [Engine Status] Baseline engine cycle executed. Game clock turn: ${city.acycle}`);

        // Bind core instances directly to window scope for easy console playground adjustments
        window.currentCityInstance = city;
        window.MicropolisTool = MicropolisTool;
        window.ToolStroke = ToolStroke;

    } catch (error) {
        console.error("❌ [MicropolisEngine] Core Simulation initialization failed:", error);
        return; 
    }

    // Phase 2: Setup Viewport Canvas Context & Start Game Loop
    try {
        console.log("🎨 Instantiating HTML5 Canvas Graphic Viewport...");
        const canvasElement = document.getElementById('gameCanvas');
        if (!canvasElement) {
            throw new Error("Could not find an HTML5 canvas element with ID 'gameCanvas' in the DOM markup context.");
        }
        
        renderer = new MapRenderer(canvasElement, city);
        window.currentMapRenderer = renderer;

        console.log("🛠️ Injecting floating user interface builder panels...");
        const toolbarUi = new Toolbar(canvasElement.parentElement || document.body);
        window.currentToolbar = toolbarUi;

        console.log("🖱️ Binding interactive mouse viewport camera controller...");
        inputController = new InputHandler(canvasElement, renderer, toolbarUi);
        window.currentInputController = inputController;

        console.log("⏱️ Initializing synchronized simulation game loops...");
        loopManager = new GameLoop(city, renderer);
        window.currentGameLoop = loopManager;
        
        loopManager.start();

    } catch (error) {
        console.error("❌ [MicropolisEngine] View layer instantiation failed:", error);
    }

    // Phase 3: Lazy-Load Graphical and Audio Assets Asynchronously
    console.log("📦 Initializing media asset preloader registry maps...");
    
    const soundManifest = {
        'bop': 'assets/sounds/bop.wav',
        'explosion-high': 'assets/sounds/explosion-high.wav',
        'layzone': 'assets/sounds/layzone.wav',
        'siren': 'assets/sounds/siren.wav'
    };

    const imageManifest = {
        'terrain': 'assets/images/terrain.png',
        'roads': 'assets/images/roads.png',
        'rails': 'assets/images/rails.png',
        'wires': 'assets/images/wires.png',
        'res_zones': 'assets/images/res_zones.png',
        'com_zones': 'assets/images/com_zones.png',
        'ind_zones': 'assets/images/ind_zones.png',
        'coal': 'assets/images/coal.png',
        'nuclear': 'assets/images/nuclear.png',
        'firestation': 'assets/images/firestation.png',
        'police': 'assets/images/police.png'
    };

    Promise.all([
        assets.loadImages(imageManifest),
        assets.loadSounds(soundManifest)
    ]).then(() => {
        console.log("🎨 Media asset textures successfully synced into memory!");
        if (renderer) renderer.render();
    }).catch(err => {
        console.error("⚠️ Background asset preloader encountered unresolvable pathways:", err);
    });
}

document.addEventListener("DOMContentLoaded", bootstrapSimulationEngine);