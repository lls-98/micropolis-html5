/**
 * MapListener acts as an abstract observer interface layer.
 * Front-end canvas layers or UI view systems extend this class 
 * to handle engine state mutations. Ports MapListener.java.
 * * @abstract
 */
export class MapListener {
    /** * Triggered on every active frame cycle of the core simulation loop.
     */
    mapAnimation() {}

    /** * Triggered when internal calculations for an overlay view (crime, traffic, etc.) update.
     * @param {string} overlayDataType - The key identifying the modified map data layer.
     */
    mapOverlayDataChanged(overlayDataType) {}

    /** * Triggered whenever a dynamic physical sprite moves or alters its tracking path.
     * @param {object} sprite - Reference to the target stateful Sprite entity instance.
     */
    spriteMoved(sprite) {}

    /** * Triggered when an operation alters a single tile coordinate value.
     * Allows granular, localized sub-region canvas screen repaints.
     * @param {number} xpos - Grid x coordinate index
     * @param {number} ypos - Grid y coordinate index
     */
    tileChanged(xpos, ypos) {}

    /** * Triggered when the entire tile grid structure is updated all at once.
     * Signals the frontend to invalidate all visual render buffers and completely redraw.
     */
    wholeMapChanged() {}
}