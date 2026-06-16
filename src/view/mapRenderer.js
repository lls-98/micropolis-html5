import { Tiles } from '../engine/tiles.js';
import { assets } from './assetLoader.js';

export class MapRenderer {
    /**
     * @param {HTMLCanvasElement} canvas - Target layout DOM element
     * @param {Micropolis} city - Core engine controller instance reference
     */
    constructor(canvas, city) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.city = city;

        // Visual constants
        this.TILE_SIZE = 16; // 16x16 pixels per tile square

        // Camera positioning offsets (for dragging/panning across the map landscape)
        this.cameraX = 0;
        this.cameraY = 0;

        // Automatically size canvas to fill container boundaries
        this.resizeViewport();
        window.addEventListener('resize', () => this.resizeViewport());
    }

    /**
     * Resizes canvas to match the physical dimension properties of its holding container.
     */
    resizeViewport() {
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
        }
        this.render();
    }

    /**
     * Renders the complete visible slice of the city simulation grid landscape.
     */
    render() {
        // Clear screen with a neutral void backdrop tone
        this.ctx.fillStyle = '#151515';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const mapWidth = this.city.getWidth();   // 120 columns
        const mapHeight = this.city.getHeight(); // 100 rows

        // Calculate cull boundaries (which columns and rows are actually inside the viewport bounds)
        const startCol = Math.max(0, Math.floor(-this.cameraX / this.TILE_SIZE));
        const endCol = Math.min(mapWidth, Math.ceil((-this.cameraX + this.canvas.width) / this.TILE_SIZE));
        
        const startRow = Math.max(0, Math.floor(-this.cameraY / this.TILE_SIZE));
        const endRow = Math.min(mapHeight, Math.ceil((-this.cameraY + this.canvas.height) / this.TILE_SIZE));

        // Render Background Grid Layer (Tile blocks loop)
        for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
                
                // 1. Snatch the raw index integer out of the 2D matrix map
                const tileId = this.city.getTile(col, row);
                
                // 2. Query its database structural metadata spec object parsed from tiles.rc
                const spec = Tiles.get(tileId);
                if (!spec) continue;

                // 3. Resolve the sheet image pointer cached in asset preloading allocations
                const imageSheet = assets.getImage(spec.imageSheet);
                
                // Screen coordinate draw position offsets
                const screenX = col * this.TILE_SIZE + this.cameraX;
                const screenY = row * this.TILE_SIZE + this.cameraY;

                if (imageSheet) {
                    // Draw sliced tile element cleanly out of its multi-file source sheet:
                    // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
                    this.ctx.drawImage(
                        imageSheet,
                        spec.sourceX, spec.sourceY, // Source clipping origin from tiles.rc
                        this.TILE_SIZE, this.TILE_SIZE, // Square texture snapshot size
                        screenX, screenY,           // Destination point relative to Canvas Viewport
                        this.TILE_SIZE, this.TILE_SIZE  // Resolution footprint size mapping dimension
                    );
                } else {
                    // Resilient color block fallback if a graphic texture asset file hasn't initialized completely
                    this.ctx.fillStyle = spec.imageSheet === 'terrain' ? '#2e7d32' : '#555';
                    this.ctx.fillRect(screenX, screenY, this.TILE_SIZE, this.TILE_SIZE);
                }
            }
        }

        // Render Dynamic Simulation Sprites Layer (Trains, Disasters, Helicopters)
        this.renderSprites();
    }

    /**
     * Loops through tracking entities and renders them overhead on the landscape grid.
     */
    renderSprites() {
        const activeSprites = this.city.allSprites ? this.city.allSprites() : this.city.sprites;
        if (!activeSprites) return;

        for (const sprite of activeSprites) {
            // 🟢 FIX: Scale engine coordinates up to physical screen pixels!
            // If the sprite coordinates are small integers/fractions (like 10, 12), 
            // multiplying by TILE_SIZE (16) transforms them to physical pixel spaces.
            
            let worldX = sprite.x;
            let worldY = sprite.y;

            // Detect if the coordinates are in tile-grid space vs pixel-space.
            // If positions are within map bounds (0-120), they need scaling:
            if (worldX < this.city.getWidth() && worldY < this.city.getHeight()) {
                worldX = worldX * this.TILE_SIZE;
                worldY = worldY * this.TILE_SIZE;
            }

            const screenX = worldX + this.cameraX;
            const screenY = worldY + this.cameraY;

            // Diagnostic circle overlay for tracking entities
            this.ctx.beginPath();
            this.ctx.arc(screenX + 8, screenY + 8, 6, 0, 2 * Math.PI);
            
            // Differentiate colors: Gray for Tornado, Red for Train
            const isTornado = sprite.constructor.name.includes('Tornado');
            this.ctx.fillStyle = isTornado ? 'rgba(170,170,170,0.85)' : 'rgba(230,50,50,0.95)';
            
            this.ctx.fill();
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();
        }
    }
}