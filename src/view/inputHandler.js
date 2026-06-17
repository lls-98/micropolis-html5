import { ToolStroke } from '../engine/toolStroke.js';

/**
 * Captures browser viewport mouse interactions to handle map navigation camera panning
 * and tool brush grid cell selection placements.
 */
export class InputHandler {
    /**
     * @param {HTMLCanvasElement} canvas - Target layout DOM element
     * @param {MapRenderer} renderer - The active painter manager instance to update
     * @param {Toolbar} toolbar - Floating UI panel selector mapping tool settings
     */
    constructor(canvas, renderer, toolbar) {
        this.canvas = canvas;
        this.renderer = renderer;
        this.toolbar = toolbar; // Store reference to detect which brush is selected

        // Internal dragging status tracking states
        this.isDragging = false;
        this.hasMovedSignificantly = false; // Tracks if the mouse moved during click down
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.initializeListeners();
    }

    initializeListeners() {
        const container = this.canvas.parentElement || this.canvas;

        // 1. Capture Click-Down Event
        container.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Only track primary left click

            this.isDragging = true;
            this.hasMovedSignificantly = false;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            
            container.style.cursor = 'grabbing';
        });

        // 2. Capture Click-Drag Movement
        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;

            // If the cursor shifted by more than 3 pixels, classify it as a map camera scroll drag
            if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
                this.hasMovedSignificantly = true;
            }

            this.renderer.cameraX += deltaX;
            this.renderer.cameraY += deltaY;

            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        // 3. Capture Click-Release Event
        window.addEventListener('mouseup', (e) => {
            if (!this.isDragging) return;
            this.isDragging = false;
            container.style.cursor = 'grab';

            // 🟢 RAYCASTING PLACEMENT PASS:
            // If the user clicked and released without dragging the camera view, 
            // process it as a tool placement stroke action on the grid coordinates!
            if (!this.hasMovedSignificantly) {
                this.handleGridCellClick(e);
            }
        });
    }

    /**
     * Translates screen coordinates to game world tiles and applies the selected tool.
     */
    handleGridCellClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        const worldPixelX = clickX - this.renderer.cameraX;
        const worldPixelY = clickY - this.renderer.cameraY;

        const tileX = Math.floor(worldPixelX / this.renderer.TILE_SIZE);
        const tileY = Math.floor(worldPixelY / this.renderer.TILE_SIZE);

        const cityInstance = this.renderer.city;

        if (tileX >= 0 && tileX < cityInstance.getWidth() && tileY >= 0 && tileY < cityInstance.getHeight()) {
            const rawToolSelection = this.toolbar.getActiveTool();
            
            console.log(`🏗️ [Placement Stroke] Tool targeting Grid: (${tileX}, ${tileY})`);

            try {
                // 1. Trace and capture the true native engine tool instance object reference
                const ToolRegistry = window.MicropolisTool || {};
                let nativeToolObj = null;

                if (rawToolSelection && typeof rawToolSelection === 'object') {
                    nativeToolObj = rawToolSelection;
                } else {
                    // Try mapping primitive integer/string keys back to the core enum objects
                    const selectionStr = String(rawToolSelection).toUpperCase();
                    nativeToolObj = Object.values(ToolRegistry).find(t => 
                        t && (String(t.key).toUpperCase() === selectionStr || String(t.name).toUpperCase() === selectionStr || t.id === rawToolSelection)
                    );
                }

                // Default safety fallback if the tool registry mapping loop comes up empty
                if (!nativeToolObj) {
                    const fallbackKey = rawToolSelection ? String(rawToolSelection).toUpperCase() : 'ROADS';
                    nativeToolObj = ToolRegistry[fallbackKey] || ToolRegistry.ROADS || { key: 'ROADS' };
                }

                // 2. Build the Proxy around our resolved tool target object
                const toolProxy = new Proxy(nativeToolObj, {
                    get: (target, prop, receiver) => {
                        let key = target.key || (target.name || '');
                        if (!key && target.toString) key = target.toString();
                        key = String(key).toUpperCase();

                        const isLine = key.includes('ROAD') || key.includes('RAIL') || key.includes('WIRE');

                        // Intercept structural query parameters requested by toolStroke.js
                        if (prop === 'isLineTool') {
                            return () => isLine;
                        }
                        if (prop === 'isAreaTool') {
                            return () => !isLine;
                        }
                        if (prop === 'isAutomatedNetworkTool') {
                            return () => key.includes('ROAD') || key.includes('RAIL');
                        }

                        // Intercept and rescue the critical .apply method if it is missing on the target!
                        if (prop === 'apply') {
                            if (typeof target.apply === 'function') {
                                return target.apply.bind(target);
                            }
                            // Fallback: If the tool instance lacks .apply, use the city's tool transaction pipeline!
                            if (cityInstance && typeof cityInstance.applyTool === 'function') {
                                return (eff) => cityInstance.applyTool(target, eff);
                            }
                            // Ultimate safe no-op closure to prevent hard crashes
                            return (eff) => console.warn(`⚠️ Tool stroke action skipped for type: ${key}. No apply handler found.`);
                        }

                        // Standard lookup fallback pass including constructor prototypes
                        let value = Reflect.get(target, prop, receiver);
                        if (value === undefined && target.constructor && target.constructor.prototype) {
                            value = target.constructor.prototype[prop];
                        }

                        if (typeof value === 'function') {
                            return value.bind(target);
                        }
                        return value;
                    }
                });

                // Pass our resilient wrapper down to the toolStroke engine pipeline
                const stroke = new ToolStroke(cityInstance, toolProxy, tileX, tileY);
                const result = stroke.apply();
                
                console.log(`✅ Stroke placement applied successfully! Return metrics:`, result);
            } catch (err) {
                console.error("❌ Placement stroke failed parsing structural attributes:", err);
            }
        }
    }
}