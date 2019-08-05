/**
 * Cauldron.js - Minecraft Server in your browser
 *
 * event.js - MCEvent - Handle Minecraft chat commands
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
  constructor (server) {
    this.commands = {}
    this.server = server

    // Add command handlers
    for (const command of commands) {
      this.addCommand(command.command, command.handle, command.info, command.usage)
    }

    debug('Constructed MCCommand with ' + Object.keys(this.commands).length + ' commands')
  }

  // Add a new command handler
  addCommand (command, handler, info, usage) {
    this.commands[command] = {
      handler,
      info,
      usage
    }
  }

  // Handle new command
  handle (command, client, clientIndex) {
    const commandComponents = command.split(' ')
    const mainCommand = commandComponents.shift()

    debug('Handling new command', mainCommand)

    if (mainCommand === 'help') {
      if (commandComponents.length === 0) {
        this.server.sendMessage(client.id, 'Availible commands:')

        for (const command of Object.keys(this.commands)) {
          this.server.sendMessage(client.id, `/${command} - ${this.commands[command].info}`)
        }
      } else if (commandComponents.length === 1) {
        if (this.commands[commandComponents[0]]) {
          const cmd = commandComponents[0]
          this.server.sendMessage(client.id, `Usage: ${this.commands[cmd].usage}`)
        } else {
          this.server.sendMessage(client.id, `Unknown command "${commandComponents[0]}"`)
        }
      } else {
        this.server.sendMessage(client.id, 'Invalid number of arguments for help')
        this.server.sendMessage(client.id, 'Usage: /help ([command])')
      }
    } else if (this.commands[mainCommand]) {
      this.commands[mainCommand].handler(mainCommand, commandComponents, client, clientIndex, this.server)
    } else {
      this.server.sendMessage(client.id, 'Unknown command')
    }
  }
}
