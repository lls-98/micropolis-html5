/**
* The Event Emitter handles handles communication between the simulation engine and the outside world. 
* This replaces the Java listener interfaces.
*/
export class EventEmitter {
    constructor() {
        this.listeners = {};
    }

    /**
     * Listen for a specific event.
     * @param {string} event - The name of the event (e.g., 'tile-changed')
     * @param {function} callback - The function to run when the event happens
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Broadcast an event to anyone listening.
     * @param {string} event - The name of the event to broadcast
     * @param {any} data - The data associated with the event
     */
    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }
}