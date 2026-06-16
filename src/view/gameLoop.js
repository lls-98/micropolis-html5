/**
 * Modern High-Performance Game Loop.
 * Coordinates simulation logic steps and canvas repaints seamlessly 
 * inside a single, unified requestAnimationFrame thread context.
 */
export class GameLoop {
    /**
     * @param {Micropolis} city - Core engine model instance reference
     * @param {MapRenderer} renderer - Canvas painting manager instance
     */
    constructor(city, renderer) {
        this.city = city;
        this.renderer = renderer;

        this.isLooping = false;
        
        // Timing constants
        this.lastTime = 0;
        this.accumulator = 0;
        this.simTickRate = 300; // Target rate: 300ms per simulation turn
    }

    /**
     * Activates the unified display loop runner.
     */
    start() {
        if (this.isLooping) return;
        this.isLooping = true;

        // Initialize lastTime with the current timestamp
        this.lastTime = performance.now();
        
        // Request the first frame from the browser
        requestAnimationFrame((timestamp) => this.loop(timestamp));
        console.log("⏱️ [Game Loop] Unified rendering and simulation thread fully engaged.");
    }

    /**
     * Halts execution loop.
     */
    stop() {
        this.isLooping = false;
    }

    /**
     * Core execution thread loop called by the browser's refresh rate.
     * @param {number} currentTime - High-precision timestamp passed by requestAnimationFrame
     */
    loop(currentTime) {
        if (!this.isLooping) return;

        // Calculate time elapsed since the last frame check in milliseconds
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Accumulate unspent time frames
        this.accumulator += deltaTime;

        // If enough time has accumulated, step the core engine logic!
        while (this.accumulator >= this.simTickRate) {
            try {
                this.city.simulateStep();
            } catch (error) {
                console.warn("⚠️ Engine simulation skipped a step due to a sub-component flag:", error.message);
            }
            this.accumulator -= this.simTickRate;
        }

        // Always redraw the canvas coordinates at the browser's maximum frame rate
        try {
            this.renderer.render();
        } catch (renderError) {
            console.error("❌ Renderer painting pass failed:", renderError);
        }

        // Recursively request the next animation pass frame from the browser
        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }
}