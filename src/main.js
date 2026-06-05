import { Micropolis } from './engine/micropolis.js';

console.log("🚀 Bootstrapping Micropolis Sandbox Environment...");

// 1. Create our engine instance
const engine = new Micropolis();

// 2. Setup standard event subscribers to make sure things are working
engine.on('clock-tick', (data) => {
    console.log(`[Clock] Month: ${data.cityTime} | Phase Schedule Step: ${data.phase}`);
});

engine.on('tile-changed', (data) => {
    console.log(`[Map Update] Tile modified at (${data.x}, ${data.y}) to ID: ${data.value}`);
});

engine.on('disaster-started', (data) => {
    console.warn(`🚨 WARNING: Disaster Type ${data.type} struck at grid coordinates (${data.x}, ${data.y})!`);
});

// 3. Test changing a tile to verify event triggers
engine.setTile(10, 10, 42);

// 4. Start a live background heartbeat interval (Ticks twice a second)
setInterval(() => {
    engine.animate();
}, 500);