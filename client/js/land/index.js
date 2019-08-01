import events from 'events'
import ChunkLoader from 'prismarine-chunk'
import Vec3 from 'vec3'
import generators from './generators'
import Debugger from 'debug'
import localForage from 'localforage'

const debug = Debugger('cauldron:land');

const EventEmitter = events.EventEmitter

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default class Land extends EventEmitter {
    constructor(version, generator) {
        super();
        this._map = new Map();
        this.version = version;
        this.generator = generators[generator](this.version)
        this.Chunk = ChunkLoader(version)

        localForage.config({
            name        : 'world',
            version     : 1.0,
            storeName   : 'world_land',
            description : 'Cauldron.JS Minecraft World'
        });
        

        this.save = this.save.bind(this)

        debug('Constructed new land');

        // Save every 10 seconds
        setInterval(this.save, 10 * 1000)
    }

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

    save() {
        debug('Saving ' + this._map.size + ' chunks');
        this._map.forEach((chunk, id) => {
            const dump = chunk.dump();

            // Convert dump to string
            let data = ''; 
            dump.forEach(function(byte) {
                data += String.fromCharCode(byte)
            });

            localForage.setItem('CHUNK-' + id, data);
        })
        this.updateWorldStats();
    }

    forEachChunk(fn) {
        this._initializer = fn;
    }

    async getChunk(chunkX, chunkZ) {
        return new Promise(async resolve => {
            const chunkID = `${chunkX}:${chunkZ}`;
            if (!this._map.has(chunkID)) {
                let chunk;
                const data = await localForage.getItem('CHUNK-' + chunkID);
                if (data) {
                    // Load data from localStorage
                    chunk = new this.Chunk();

                    let dump = new Uint8Array(data.length);
                    for (let i = 0, strLen = data.length; i < strLen; i++) {
                        dump[i] = data.charCodeAt(i);
                    }
    
                    chunk.load(Buffer.from(dump));
                } else {
                    // Generate new chunk
                    chunk = this.generator();
                }
                this._map.set(chunkID, chunk);
            }
            resolve(this._map.get(chunkID));
            this.updateWorldStats();
        })
    }

    async setBlock (x, y, z, block) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        const chunk = await this.getChunk(chunkX, chunkZ);
        chunk.setBlock(new Vec3(x & 0x0f, y, z & 0x0f), block);
        this.emit('changed', chunkX, chunkZ);
    };

    getBlock (x, y, z) {
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

}