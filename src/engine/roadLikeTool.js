/**
 * RoadLikeTool acts as the orchestrator for all line-drawn infrastructure (Roads, Rail, Wires).
 * It calculates drag bounding rects and runs the multi-pass forward/backward sweeps
 * ported from RoadLikeTool.java.
 */
export class RoadLikeTool {
    /**
     * Computes the layout boundary box constrained to a straight horizontal or vertical line.
     * Ports getBounds() from RoadLikeTool.java.
     */
    static getBounds(xpos, ypos, xdest, ydest) {
        if (Math.abs(xdest - xpos) >= Math.abs(ydest - ypos)) {
            // Horizontal line drag
            return {
                x: Math.min(xpos, xdest),
                y: ypos,
                width: Math.abs(xdest - xpos) + 1,
                height: 1
            };
        } else {
            // Vertical line drag
            return {
                x: xpos,
                y: Math.min(ypos, ydest),
                width: 1,
                height: Math.abs(ydest - ypos) + 1
            };
        }
    }

    /**
     * Runs the infinite layout synchronization loop until the map settles.
     * Ports applyArea(ToolEffectIfc eff) from RoadLikeTool.java.
     * @param {object} city - Main engine context
     * @param {object} bounds - The drag rectangle boundaries
     * @param {function} singlePlacerFunc - The cell-specific placement function to run
     */
    static applyArea(city, bounds, singlePlacerFunc) {
        let loopSafety = 0;
        
        while (loopSafety < 20) {
            let forwardChange = this.applyForward(city, bounds, singlePlacerFunc);
            let backwardChange = this.applyBackward(city, bounds, singlePlacerFunc);
            
            // If neither sweep altered any infrastructure, our road network has fully connected!
            if (!forwardChange && !backwardChange) {
                break;
            }
            loopSafety++;
        }
    }

    /**
     * Sweeps from top-left to bottom-right across the selection.
     */
    static applyForward(city, bounds, singlePlacerFunc) {
        let anyChange = false;
        for (let i = 0; i < bounds.height; i++) {
            for (let j = 0; j < bounds.width; j++) {
                const x = bounds.x + j;
                const y = bounds.y + i;
                if (singlePlacerFunc(city, x, y)) {
                    anyChange = true;
                }
            }
        }
        return anyChange;
    }

    /**
     * Sweeps from bottom-right back to top-left to resolve snapping.
     */
    static applyBackward(city, bounds, singlePlacerFunc) {
        let anyChange = false;
        for (let i = bounds.height - 1; i >= 0; i--) {
            for (let j = bounds.width - 1; j >= 0; j--) {
                const x = bounds.x + j;
                const y = bounds.y + i;
                if (singlePlacerFunc(city, x, y)) {
                    anyChange = true;
                }
            }
        }
        return anyChange;
    }
}