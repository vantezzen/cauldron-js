/**
 * Cauldron.js - Minecraft Server in your browser
 * 
 * event.js - MCEvent - Handle Minecraft Event
 * 
 * @version     0.1.0
 * @copyright   Copyright vantezzen (https://github.com/vantezzen)
 * @link        https://github.com/vantezzen/cauldron-js
 * @license     https://opensource.org/licenses/mit-license.php MIT License
 */
import events from './events'

export default class MCEvent {
    constructor() {
        this.events = {};

        // Add event handlers
        for (const event of events) {
            if (!this.events[event.event]) {
                this.events[event.event] = [];
            }

            this.events[event.event].push(
                event.handle
            );
        }
    }

    // Handle new event
    handle(event, data, metadata, id, uuid, server) {
        if (this.events[event]) {
            for (const handler of this.events[event]) {
                handler(event, data, metadata, id, uuid, server);
            }
        }
    }
}