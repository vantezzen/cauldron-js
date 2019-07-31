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
import commands from './commands'
import Debugger from 'debug'
const debug = Debugger('cauldron:mc-command')

export default class MCCommand {
    constructor(server) {
        this.commands = {};
        this.server = server;

        // Add command handlers
        for (const command of commands) {
            this.commands[command.command] = command.handle;
        }

        debug('Constructed MCCommand with ' + Object.keys(this.commands).length + ' commands')
    }

    // Handle new command
    handle(command, id, uuid) {
        const commandComponents = command.split(' ')
        const mainCommand = commandComponents.shift();

        debug('Handling new command', mainCommand);

        if (this.commands[mainCommand]) {
            this.commands[mainCommand](mainCommand, commandComponents, id, uuid, this.server);
        } else {
            this.server.sendMessage(id, 'Unknown command');
        }
    }
}