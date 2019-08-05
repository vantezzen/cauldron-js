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
import Debugger from 'debug'
const debug = Debugger('cauldron:mc-event')

export default class MCEvent {
    constructor() {
        this.events = {};

        // Add event handlers
        for (const event of events) {
            this.addHandler(event.event, event.handle)
        }

        debug('Constructed MCEvent for ' + Object.keys(this.events).length + ' events')
    }

    addHandler(event, handler) {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(handler);
    }

    // Handle new event
    handle(event, data, metadata, client, clientIndex, server) {
        // debug('Handling new MCEvent', event, id);
        if (this.events[event]) {
            for (const handler of this.events[event]) {
                handler(event, data, metadata, client, clientIndex, server);
            }
        }
    }
}