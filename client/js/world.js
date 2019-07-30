import spiralloop from 'spiralloop'

import World from './world/index'
import generator from './world/generators/grass'
const BrowserFS = require('browserfs')

export default class MCWorld {
    constructor(version, server) {
        const self = this;

        BrowserFS.configure({
            fs: "LocalStorage"
        }, ((e) => {
        if (e) {
            console.error('BrowserFS error:', e);
            return;
        }
            const fs = BrowserFS.BFSRequire('fs');
            fs.mkdir('/overworld', (() => {
                self.world = new(World(version))(generator(version), '/overworld');
                self.server = server;
            }));    
        }));
    }

    pregen(size) {
        const promises = []
        for (let x = -size; x < size; x++) {
            for (let z = -size; z < size; z++) {
                promises.push(
                    this.world.getColumn(x, z)
                )
            }
        }
        return Promise.all(promises)
    }

    sendNearbyChunks(player) {
        console.log('A', player.uuid);
        // Get current player position
        this.server.db.players.get(player.uuid).then(data => {
            let position;
            if (!data) {
                position = {
                    x: 15,
                    y: 101,
                    z: 15
                }
            } else {
                position = {
                    x: data.x,
                    y: data.y,
                    z: data.z
                }
            }

            player.lastPositionChunkUpdated = position
            const playerChunkX = Math.floor(position.x / 16)
            const playerChunkZ = Math.floor(position.z / 16)

            const view = 12;

            function spiral (arr) {
                const t = []
                spiralloop(arr, (x, z) => {
                    t.push([x, z])
                })
                return t
            }

            const nearbyChunks = [
                [0,0],
                [-1,-1],
                [-1,0],
                [-1,1],
                [0,-1],
                [0,1],
                [1,-1],
                [1,0],
                [1,1]
            ]
            
            for(const chunk of nearbyChunks) {
                const chunkX = playerChunkX + chunk[0];
                const chunkZ = playerChunkZ + chunk[1];

                this.world.getColumn(chunkX, chunkZ)
                .then((column) => {
                    this.world.setColumn(chunkX, chunkZ, column)
                    this.sendChunk(player.id, chunkX, chunkZ, column)
                })
            }
        })

    }

    sendChunk(playerId, x, z, chunk) {
        this.server.write(playerId, 'map_chunk', {
            x: x,
            z: z,
            groundUp: true,
            bitMap: 0xffff,
            chunkData: chunk.dump(),
            blockEntities: []
        })
    }
}