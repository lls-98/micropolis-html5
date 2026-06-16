/**
 * Captures browser viewport mouse interactions to handle map navigation camera panning.
 */
export class InputHandler {
    /**
     * @param {HTMLCanvasElement} canvas - Target layout DOM element
     * @param {MapRenderer} renderer - The active painter manager instance to update
     */
    constructor(canvas, renderer) {
        this.canvas = canvas;
        this.renderer = renderer;

        // Internal dragging status tracking states
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.initializeListeners();
    }

    /**
     * Binds mouse pointer intercept hooks to the container window.
     */
    initializeListeners() {
        const container = this.canvas.parentElement || this.canvas;

        // 1. Capture Click-Down Event
        container.addEventListener('mousedown', (e) => {
            // Only respond to standard left-clicks
            if (e.button !== 0) return;

            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            
            // Alter cursor style to indicate active grabbing action
            container.style.cursor = 'grabbing';
        });

        // 2. Capture Click-Drag Movement
        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            // Calculate the spatial coordinate distance shift since the last frame check
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;

            // Apply shifts straight onto our viewport camera lens vectors
            this.renderer.cameraX += deltaX;
            this.renderer.cameraY += deltaY;

            // Cache current coordinates as the new benchmark position
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;

            // Trigger an immediate canvas repaint to show the updated camera position
            this.renderer.render();
        });

        // 3. Capture Click-Release Event
        window.addEventListener('mouseup', (e) => {
            if (!this.isDragging) return;

            this.isDragging = false;
            container.style.cursor = 'grab';
        });

        // Optional safety intercept: stop drag state if cursor drifts entirely off-screen
        container.addEventListener('mouseleave', () => {
            if (this.isDragging) {
                this.isDragging = false;
                container.style.cursor = 'grab';
            }
        });
    }
}