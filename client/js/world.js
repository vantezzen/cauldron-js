/**
 * Cauldron.js - Minecraft Server in your browser
 * 
 * MCWorld - Manage minecraft world and its chunks
 * 
 * Based on nodecraft's land system (https://github.com/YaroslavGaponov/nodecraft/blob/628a256935/src/land/index.js)
 * and flying-squid's world system (https://github.com/PrismarineJS/flying-squid/blob/master/src/lib/plugins/world.js)
 * 
 * @version     0.1.0
 * @copyright   Copyright vantezzen (https://github.com/vantezzen)
 * @link        https://github.com/vantezzen/cauldron-js
 * @license     https://opensource.org/licenses/mit-license.php MIT License
 */
import events from 'events'
import ChunkLoader from 'prismarine-chunk'
import Vec3 from 'vec3'
import generators from './generators'
import localForage from 'localforage'

import Debugger from 'debug'
const debug = Debugger('cauldron:mc-world')

const EventEmitter = events.EventEmitter

// Format bytes to human-readable size (Source: https://stackoverflow.com/a/18650828/10590162)
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default class MCWorld extends EventEmitter {
    constructor(version, generator, server) {
        super();

        this.server = server;

        this._map = new Map(); // Saving a map of current chunks
        this.version = version; // Current minecraft version
        this.generator = generators[generator]({
            version,
            seed: server.seed
        }) // Generator to use
        this.Chunk = ChunkLoader(version) // Chunk version to use

        // Initialise localForage for storing minecraft world
        localForage.config({
            name: 'world',
            version: 1.0,
            storeName: 'world_land',
            description: 'Cauldron.JS Minecraft World'
        });

        // Save world every 10 seconds
        this.save = this.save.bind(this)
        setInterval(this.save, 10 * 1000)

        this.updateWorldStats();

        debug('Constructed new MCWorld');
    }

    // Update stats about world on page
    updateWorldStats() {
        document.getElementById('chunks').innerText = this._map.size;
        if (navigator.storage && navigator.storage.estimate) {
            navigator.storage.estimate().then(estimate => {
                const usage = Math.round((estimate.usage / estimate.quota) * 100)

                const text = `${usage}% (${formatBytes(estimate.usage, 0)} of ${formatBytes(estimate.quota, 0)})`

                document.getElementById('storage').innerText = text;
            })
        }
    }

    // Clean map of loaded chunks to only contain up to 50 chunks
    cleanLoadedChunks() {
        const maxChunks = 50;

        // Keep number of loaded chunks below maxChunks
        const entries = this._map.entries();
        while (this._map.size > maxChunks) {
            this._map.delete(entries.next().value[0])
        }
    }

    // Save world to localForage
    save() {
        debug('Saving ' + this._map.size + ' chunks');

        this._map.forEach((chunk, id) => {
            const dump = chunk.dump();

            // Convert dump to string
            let data = '';
            dump.forEach(function (byte) {
                data += String.fromCharCode(byte)
            });

            localForage.setItem('r-' + id, data);
        })
        this.cleanLoadedChunks();
        this.updateWorldStats();
    }

    forEachChunk(fn) {
        this._initializer = fn;
    }

    // Send chunks that are near a player to the client
    sendNearbyChunks(x, z, id) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        // Chunk radius to send to client
        const distance = 5;
        for (let x = chunkX - distance; x < chunkX + distance; x++) {
            for (let z = chunkZ - distance; z < chunkZ + distance; z++) {
                const chunkId = `${x}:${z}`;
                if (!this.server.clientChunks.get(id).has(chunkId)) {
                    this.server.clientChunks.get(id).add(chunkId)
                    this.getChunk(x, z).then(chunk => {
                        this.sendChunk(id, x, z, chunk.dump())
                    });
                }
            }
        }

        this.cleanLoadedChunks();
    }

    // Get prismarine-chunk object for a chunk
    async getChunk(chunkX, chunkZ) {
        return new Promise(async resolve => {
            const chunkID = `${chunkX}:${chunkZ}`;
            if (!this._map.has(chunkID)) {
                let chunk;
                const data = await localForage.getItem('r-' + chunkID);
                if (data) {
                    // Load data from localStorage
                    chunk = new this.Chunk();

                    let dump = new Uint8Array(data.length);
                    for (let i = 0, strLen = data.length; i < strLen; i++) {
                        dump[i] = data.charCodeAt(i);
                    }

                    chunk.load(Buffer.from(dump));

                    // Fill chunk with light
                    for (let x = 0; x < 16; x++) {
                        for (let z = 0; z < 16; z++) {
                            for (let y = 0; y < 256; y++) {
                                chunk.setSkyLight(new Vec3(x, y, z), 15)
                            }
                        }
                    }
                } else {
                    // Generate new chunk
                    chunk = this.generator(chunkX, chunkZ);
                }
                this._map.set(chunkID, chunk);
            }
            resolve(this._map.get(chunkID));
            this.updateWorldStats();
        })
    }

    async setBlock(x, y, z, block) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        const chunk = await this.getChunk(chunkX, chunkZ);
        chunk.setBlock(new Vec3(x & 0x0f, y, z & 0x0f), block);
        this.emit('changed', chunkX, chunkZ);
    };

    getBlock(x, y, z) {
        return new Promise(async resolve => {
            const chunkX = x >> 4;
            const chunkZ = z >> 4;
            const chunk = await this.getChunk(chunkX, chunkZ);
            const block = chunk.getBlock(new Vec3(x & 0x0f, y, z & 0x0f));
            resolve(block);
        })
    };

    async setType(x, y, z, type) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        const chunk = await this.getChunk(chunkX, chunkZ);
        chunk.setBlockType(new Vec3(x & 0x0f, y, z & 0x0f), type);
        this.emit('changed', chunkX, chunkZ);
    }

    getType(x, y, z) {
        return new Promise(async resolve => {
            const chunkX = x >> 4;
            const chunkZ = z >> 4;
            const chunk = await this.getChunk(chunkX, chunkZ);
            resolve(chunk.getBlockType(new Vec3(x & 0x0f, y, z & 0x0f)));
        })
    }

    setAddition(x, y, z, type) {
        // const chunkX = x >> 4;
        // const chunkZ = z >> 4;
        // this.getChunk(chunkX, chunkZ).setAddition(x & 0x0f, y, z & 0x0f, type);
        // this.emit('changed', chunkX, chunkZ);
        return this;
    }


    async setLightBlock(x, y, z, light) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        const chunk = await this.getChunk(chunkX, chunkZ);
        chunk.setBlockLight(new Vec3(x & 0x0f, y, z & 0x0f), light);
        this.emit('changed', chunkX, chunkZ);
        return this;
    }

    getLightBlock(x, y, z) {
        return new Promise(async resolve => {
            const chunkX = x >> 4;
            const chunkZ = z >> 4;
            const chunk = await this.getChunk(chunkX, chunkZ);
            resolve(chunk.getBlockLight(new Vec3(x & 0x0f, y, z & 0x0f)));
        })
    }

    async setLightSky(x, y, z, light) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        const chunk = await this.getChunk(chunkX, chunkZ);
        chunk.setSkyLight(new Vec3(x & 0x0f, y, z & 0x0f), light);
        this.emit('changed', chunkX, chunkZ);
        return this;
    }

    getLightSky(x, y, z) {
        return new Promise(async resolve => {
            const chunkX = x >> 4;
            const chunkZ = z >> 4;
            const chunk = await this.getChunk(chunkX, chunkZ);
            resolve(chunk.getSkyLight(new Vec3(x & 0x0f, y, z & 0x0f)));
        });
    }


    async setBiome(x, z, biome) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        const chunk = await this.getChunk(chunkX, chunkZ);
        chunk.setBiome(new Vec3(x & 0x0f, 0, z & 0x0f), biome);
        this.emit('changed', chunkX, chunkZ);
        return this;
    }

    getBiome(x, z) {
        return new Promise(async resolve => {
            const chunkX = x >> 4;
            const chunkZ = z >> 4;
            const chunk = await this.getChunk(chunkX, chunkZ);
            resolve(chunk.getBiome(new Vec3(x & 0x0f, 0, z & 0x0f)));
        });
    }

    sendChunk(playerId, x, z, chunk) {
        this.server.write(playerId, 'map_chunk', {
            x: x,
            z: z,
            groundUp: true,
            bitMap: 0xffff,
            primary_bitmap: 65535,
            add_bitmap: 65535,
            chunkData: chunk,
            blockEntities: []
        })
    }
}