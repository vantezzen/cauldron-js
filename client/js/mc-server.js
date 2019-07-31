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
    constructor(socket, version, db) {
        this.socket = socket;
        this.Chunk = ChunkLoader(version);
        this.db = db;
        this.event = new MCEvent;
        this.world = new MCWorld(version, this)
        this.command = new MCCommand(this)
        this.clients = [];

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

    newClient(client) {
        this.clients.push(client);
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

        debug('Generating sample chunk');
        this.world.sendNearbyChunks(client);
        
        // const chunk = new (this.Chunk)()
        // for (let x = 0; x < 16; x++) {
        //     for (let z = 0; z < 16; z++) {
        //         chunk.setBlockType(new Vec3(x, 50, z), 2)
        //         for (let y = 0; y < 256; y++) {
        //             chunk.setSkyLight(new Vec3(x, y, z), 15)
        //         }
        //     }
        // }

        // debug('Sending sample chunks to client');
        // this.write(client.id, 'map_chunk', {
        //     x: 0,
        //     z: 0,
        //     groundUp: true,
        //     bitMap: 0xffff,
        //     chunkData: chunk.dump(),
        //     blockEntities: []
        // })
        // this.write(client.id, 'map_chunk', {
        //     x: 1,
        //     z: 1,
        //     groundUp: true,
        //     bitMap: 0xffff,
        //     chunkData: chunk.dump(),
        //     blockEntities: []
        // })
        // this.write(client.id, 'map_chunk', {
        //     x: 1,
        //     z: 0,
        //     groundUp: true,
        //     bitMap: 0xffff,
        //     chunkData: chunk.dump(),
        //     blockEntities: []
        // })

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