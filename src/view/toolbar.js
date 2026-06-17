import { MicropolisTool } from '../engine/micropolisTool.js';

/**
 * Manages active building brush selection states and constructs a basic HTML overlay interface.
 */
export class Toolbar {
    /**
     * @param {HTMLElement} containerElement - The DOM container holding our canvas workspace.
     */
    constructor(containerElement) {
        this.container = containerElement;
        
        // 🟢 FIX: Use the actual native class object as your default state
        this.activeTool = MicropolisTool.ROADS; 
        this.onToolChanged = null; 

        this.buildUI();
    }

    /**
     * Injects a floating HTML action bar onto the game container screen.
     */
    buildUI() {
        const panel = document.createElement('div');
        panel.id = 'simulation-toolbar';
        panel.style.position = 'absolute';
        panel.style.top = '10px';
        panel.style.left = '10px';
        panel.style.zIndex = '100';
        panel.style.background = 'rgba(30, 30, 30, 0.85)';
        panel.style.padding = '8px';
        panel.style.borderRadius = '6px';
        panel.style.display = 'flex';
        panel.style.gap = '6px';
        panel.style.border = '1px solid #444';
        panel.style.boxShadow = '0 4px 10px rgba(0,0,0,0.5)';

        // Map the buttons directly to the real MicropolisTool object keys
        const toolsConfig = [
            { id: MicropolisTool.BULLDOZER, label: '🚜 Bulldozer' },
            { id: MicropolisTool.ROADS, label: '🛣️ Roads' },
            { id: MicropolisTool.RAIL, label: '🚂 Rail' },
            { id: MicropolisTool.WIRE, label: '⚡ Wires' },
            { id: MicropolisTool.RESIDENTIAL, label: '🟢 Residential' },
            { id: MicropolisTool.COMMERCIAL, label: '🔵 Commercial' },
            { id: MicropolisTool.INDUSTRIAL, label: '🟡 Industrial' }
        ];

        this.buttons = new Map();

        toolsConfig.forEach(tool => {
            const btn = document.createElement('button');
            btn.innerText = tool.label;
            btn.style.padding = '6px 12px';
            btn.style.background = '#252525';
            btn.style.color = '#fff';
            btn.style.border = '1px solid #555';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.style.fontSize = '12px';
            btn.style.transition = 'all 0.15s ease';

            btn.addEventListener('click', () => this.selectTool(tool.id));
            
            panel.appendChild(btn);
            this.buttons.set(tool.id, btn);
        });

        this.container.appendChild(panel);
        this.updateActiveButtonVisuals();
    }

    selectTool(toolObj) {
        this.activeTool = toolObj;
        this.updateActiveButtonVisuals();
        console.log(`🖌️ [Active Brush Swapped] Focused Tool:`, toolObj);
        
        if (typeof this.onToolChanged === 'function') {
            this.onToolChanged(toolObj);
        }
    }

    updateActiveButtonVisuals() {
        this.buttons.forEach((btn, id) => {
            if (id === this.activeTool) {
                btn.style.background = '#007acc';
                btn.style.borderColor = '#00ffff';
                btn.style.fontWeight = 'bold';
            } else {
                btn.style.background = '#252525';
                btn.style.borderColor = '#555';
                btn.style.fontWeight = 'normal';
            }
        });
    }

    getActiveTool() {
        return this.activeTool;
    }
}