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
import ChunkLoader from 'prismarine-chunk'
import MCEvent from './event'
import MCWorld from './world'
import MCCommand from './command'

// Create debugger for MCServer
const debug = Debugger('cauldron:mc-server');

export default class MCServer {
    constructor(socket, version, db, generator) {
        this.socket = socket;
        this.Chunk = ChunkLoader(version);
        this.db = db;
        this.event = new MCEvent;
        this.world = new MCWorld(version, generator, this)
        this.command = new MCCommand(this)
        
        // Array of minecraft clients currently connected
        this.clients = [];
        
        // Keep map of what chunks a client has loaded
        this.clientChunks = new Map();

        this.updateServerStats();

        debug('Started MC Server');
    }

    // Convert float (degrees) --> byte (1/256 "degrees")
    // Source: https://github.com/PrismarineJS/flying-squid/blob/43b665bb84afc44f58758671d5a1e8bc75809cbe/src/lib/plugins/updatePositions.js
    conv(f) {
        let b = Math.floor((f % 360) * 256 / 360)
        if (b < -128) b += 256
        else if (b > 127) b -= 256
        return b
    }

    // Update stats about MC Server on page
    updateServerStats() {
        document.getElementById('players').innerText = this.clients.length;
    }

    newClient(client) {
        this.clients.push(client);
        this.clientChunks.set(client.id, new Set())
        this.updateServerStats();
        debug('New client connected with ID of', client.id);

        this.write(client.id, 'login', {
            entityId: client.id,
            levelType: 'default',
            gameMode: 1,
            dimension: 0,
            difficulty: 2,
            maxPlayers: 10,
            reducedDebugInfo: false
        })
        debug('Written login package to new client');

        // Get player position
        this.db.players.get(client.uuid)
            .then(data => {
                if (!data) {
                    debug('Adding new player to database');

                    this.db.players.add({
                        uuid: client.uuid,
                        x: 15,
                        y: 101,
                        z: 15,
                        yaw: 137,
                        pitch: 0
                    });

                    data = {};
                }
                debug('Writing position package to new client');
                this.write(client.id, 'position', {
                    x: data.x || 15,
                    y: data.y || 101,
                    z: data.z || 15,
                    yaw: data.yaw || 137,
                    pitch: data.pitch || 0,
                    flags: 0x00
                })
                this.writeOthers(client.id, 'named_entity_spawn', {
                    entityId: client.id,
                    playerUUID: client.uuid,
                    type: 'player',
                    x: data.x || 15,
                    y: data.y || 101,
                    z: data.z || 15,
                    yaw: this.conv(data.yaw) || 0,
                    pitch: this.conv(data.pitch) || 0,
                    currentItem: 0,
                    metadata: []
                })        
            });


        debug('Writing welcome message package to new client');
        const msg = {
            translate: 'chat.type.announcement',
            "with": [
                'CauldronJS',
                client.username + ' joined the server.'
            ]
        };
        this.writeAll("chat", {
            message: JSON.stringify(msg),
            position: 0
        });

        // Spawn other players
        for (const player of this.clients) {
            if (player.id !== client.id) {
                this.db.players.get(player.uuid)
                .then(data => {
                    debug('Spawning other player to new client');
                    this.write(client.id, 'named_entity_spawn', {
                        entityId: player.id,
                        playerUUID: player.uuid,
                        type: 'player',
                        x: data.x,
                        y: data.y,
                        z: data.z,
                        yaw: this.conv(data.yaw),
                        pitch: this.conv(data.pitch),
                        currentItem: 0,
                        metadata: []
                    })
                });
                
            }
        }
    }

    // Handle client disconnecting from server
    handleDisconnect(client, reason) {
        this.clients = this.clients.filter(el => el.id !== client);
        this.clientChunks.delete(client)

        this.updateServerStats();

        debug('Client disconnected from server');
    }

    // Handle event from minecraft client
    handleEvent(event, data, metadata, id, uuid) {
        this.event.handle(event, data, metadata, id, uuid, this);
    }

    // Handle command from player
    handleCommand(command, id, uuid) {
        this.command.handle(command, id, uuid);
    }

    // Send message to client
    sendMessage(id, text) {
        const msg = {
            translate: 'chat.type.announcement',
            "with": [
                'CauldronJS',
                text
            ]
        };
        this.write(id, "chat", {
            message: JSON.stringify(msg),
            position: 0
        });
    }

    // Write a package to all players
    writeAll(type, data) {
        for (const player of this.clients) {
            this.write(player.id, type, data)
        }
    }

    // Write a package to all player except one
    writeOthers(clientId, type, data) {
        for (const player of this.clients) {
            if (player.id !== clientId) {
                this.write(player.id, type, data)
            }
        }
    }

    // Write a package to one player
    write(clientId, type, data) {
        this.socket.emit('write', clientId, type, data)
    }
}