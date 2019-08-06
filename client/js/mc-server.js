/**
 * Cauldron.js - Minecraft Server in your browser
 *
 * mc-server.js - MCServer - Manage server
 *
 * @version     0.1.0
 * @copyright   Copyright vantezzen (https://github.com/vantezzen)
 * @link        https://github.com/vantezzen/cauldron-js
 * @license     https://opensource.org/licenses/mit-license.php MIT License
 */
import Debugger from 'debug'
import Vec3 from 'vec3'
import MCEvent from './event'
import MCWorld from './world'
import MCCommand from './command'

// Create debugger for MCServer
const debug = Debugger('cauldron:mc-server')

export default class MCServer {
  constructor (socket, version, db, generator, seed) {
    this.socket = socket // Current socket connection to backend
    this.db = db // Dexie database instance
    this.seed = seed
    this.version = version
    this.generator = generator
    this.event = new MCEvent() // Event handler for minecraft client events
    this.world = new MCWorld(version, generator, this) // Overworld
    this.command = new MCCommand(this) // Handler for minecraft commands

    // Array of minecraft clients currently connected
    this.clients = []

    // Keep map of what chunks a client has loaded
    this.clientChunks = new Map()

    // Keep client settings
    this.clientSettings = {}

    // Load all plugins
    this.loadPlugins()

    // Show current stats
    this.updateServerStats()

    // Start interval to check performance
    this.checkPerformance()

    debug('Started MC Server')
  }

  // Include all plugins inside the plugins/ directory
  loadPlugins () {
    const plugins = require.context('./plugins', true, /.*\.js$/)
    plugins.keys().forEach((plugin) => {
      const init = plugins(plugin).default
      init(this)
    })
  }

  // Convert float (degrees) --> byte (1/256 "degrees"), needed for head rotation
  // Source: https://github.com/PrismarineJS/flying-squid/blob/43b665bb84afc44f58758671d5a1e8bc75809cbe/src/lib/plugins/updatePositions.js
  conv (f) {
    let b = Math.floor((f % 360) * 256 / 360)
    if (b < -128) b += 256
    else if (b > 127) b -= 256
    return b
  }

  // Update stats about MC Server on page
  updateServerStats () {
    document.getElementById('players').innerText = this.clients.length
  }

  // Check JavaScript performance to guesstimate CPU load
  // Check time it takes for the browser between executing a 0ms interval
  // This should give us a very rough estimation but is only really useful
  // to check if the CPU load is very high.
  // This results in the CPU load percentage shown not really being too meaningful
  checkPerformance () {
    let last = new Date().getTime()
    let intervalsSince = 0

    setInterval(() => {
      if (intervalsSince > 50) {
        intervalsSince = 0
        const now = new Date().getTime()
        let load = Math.round(((now - last) / 50) * 10)
        last = new Date().getTime()

        if (load > 100) {
          load = '>100'
        }

        document.getElementById('cpu').innerText = load + '%'
      }

      intervalsSince++
    }, 0)
  }

  // Handle new client connecting to server
  newClient (client) {
    // Add additional info to client
    client.gameMode = 1

    // Add client to clients list
    this.clients.push(client)
    const clientIndex = this.clients.findIndex(el => el.id === client.id)
    this.clientChunks.set(client.id, new Set())
    this.updateServerStats()
    debug('New client connected with ID of', client.id)

    // Write login package
    this.write(client.id, 'login', {
      entityId: client.id,
      levelType: 'default',
      gameMode: 1,
      dimension: 0,
      difficulty: 2,
      maxPlayers: 10,
      reducedDebugInfo: false
    })
    debug('Written login package to new client')

    // Update tab lists for all players
    this.writeAll('player_info', {
      action: 0,
      data: this.clients.map((otherPlayer) => ({
        UUID: otherPlayer.uuid,
        name: otherPlayer.username,
        properties: []
      }))
    })

    // Get player position from database
    this.db.players.get(client.uuid)
      .then(data => {
        if (!data) {
          // Player not yet in db, add new
          debug('Adding new player to database')

          this.db.players.add({
            uuid: client.uuid,
            x: 15,
            y: 101,
            z: 15,
            yaw: 137,
            pitch: 0
          })

          data = {}
        }
        const pos = {
          x: data.x || 15,
          y: data.y || 101,
          z: data.z || 15
        }

        debug('Writing position package to new client')
        this.write(client.id, 'position', {
          ...pos,
          yaw: data.yaw || 137,
          pitch: data.pitch || 0,
          flags: 0x00
        })

        this.clients[clientIndex].position = {
          ...pos,
          yaw: data.yaw || 137,
          pitch: data.pitch || 0,
          onGround: data.onGround || false
        }

        // Send nearby chunks to client
        this.world.sendNearbyChunks(data.x || 15, data.z || 15, client.id)

        // Teleport player to new position
        const entityPosition = new Vec3(
          pos.x,
          pos.y,
          pos.z
        ).scaled(32).floored()

        this.writeOthers(client.id, 'named_entity_spawn', {
          entityId: client.id,
          playerUUID: client.uuid,
          x: entityPosition.x,
          y: entityPosition.y,
          z: entityPosition.z,
          yaw: this.conv(data.yaw) || 0,
          pitch: this.conv(data.pitch) || 0,
          currentItem: 0,
          metadata: []
        })
        this.writeOthers(client.id, 'entity_teleport', {
          entityId: client.id,
          onGround: data.onGround,
          ...pos
        })
      })

    // Show welcome message to all users
    debug('Writing welcome message package for new client')
    const msg = {
      translate: 'chat.type.announcement',
      with: [
        'CauldronJS',
        client.username + ' joined the server.'
      ]
    }
    this.writeAll('chat', {
      message: JSON.stringify(msg),
      position: 0
    })

    // Spawn other players
    for (const player of this.clients) {
      if (player.id !== client.id) {
        const entityPosition = new Vec3(
          player.position.x || 15,
          player.position.y || 101,
          player.position.z || 15
        ).scaled(32).floored()

        this.write(client.id, 'named_entity_spawn', {
          entityId: player.id,
          playerUUID: player.uuid,
          x: entityPosition.x,
          y: entityPosition.y,
          z: entityPosition.z,
          yaw: this.conv(player.position.yaw) || 0,
          pitch: this.conv(player.position.pitch) || 0,
          currentItem: 0,
          metadata: []
        })
        this.write(client.id, 'entity_teleport', {
          entityId: player.id,
          x: player.position.x || 15,
          y: player.position.y || 101,
          z: player.position.z || 15,
          onGround: player.position.onGround
        })
      }
    }
    debug('Spawned other players for new client')

    this.event.handle('login', {}, {}, client, clientIndex, this)
  }

  // Handle client disconnecting from server
  handleDisconnect (client, reason) {
    this.clients = this.clients.filter(el => el.id !== client)
    this.clientChunks.delete(client)

    this.updateServerStats()

    debug('Client disconnected from server')
  }

  // Handle event from minecraft client
  handleEvent (event, data, metadata, id) {
    const client = this.clients.findIndex(el => el.id === id)
    this.event.handle(event, data, metadata, this.clients[client], client, this)
  }

  // Handle command from player
  handleCommand (command, client, clientIndex) {
    this.command.handle(command, client, clientIndex)
  }

  // Send message to client
  sendMessage (id, text) {
    const msg = {
      translate: 'chat.type.announcement',
      with: [
        'CauldronJS',
        text
      ]
    }
    this.write(id, 'chat', {
      message: JSON.stringify(msg),
      position: 0
    })
  }

  // Write a package to all players
  writeAll (type, data) {
    for (const player of this.clients) {
      this.write(player.id, type, data)
    }
  }

  // Write a package to all player except one
  writeOthers (clientId, type, data) {
    for (const player of this.clients) {
      if (player.id !== clientId) {
        this.write(player.id, type, data)
      }
    }
  }

  // Write a package to one player
  write (clientId, type, data) {
    this.socket.emit('write', clientId, type, data)
  }

  // Stop the server
  stop () {
    this.socket.emit('stop')
  }
}
