import events from 'events'
import ChunkLoader from 'prismarine-chunk'
import Vec3 from 'vec3'
import Generator from './generators/grass'
import Debugger from 'debug'

const debug = Debugger('cauldron:land');

const EventEmitter = events.EventEmitter

export default class Land extends EventEmitter {
    constructor(version) {
        super();
        this._map = new Map();
        this.version = version;
        this.generator = Generator(this.version)
        this.Chunk = ChunkLoader(version)

        this.save = this.save.bind(this)

        debug('Constructed new land');

        // Save every 10 seconds
        setInterval(this.save, 10 * 1000)
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

            localStorage.setItem('CHUNK-' + id, data);
        })
    }

    forEachChunk(fn) {
        this._initializer = fn;
        return this;
    }

    getChunk(chunkX, chunkZ) {
        const chunkID = `${chunkX}:${chunkZ}`;
        if (!this._map.has(chunkID)) {
            let chunk;
            if (localStorage.getItem('CHUNK-' + chunkID)) {
                // Load data from localStorage
                chunk = new this.Chunk();

                const data = localStorage.getItem('CHUNK-' + chunkID);
                let dump = new Uint8Array(data.length);
                for (let i = 0, strLen = data.length; i < strLen; i++) {
                    dump[i] = data.charCodeAt(i);
                }

                console.log('Loading chunk from localStorage', dump);

                chunk.load(Buffer.from(dump));
            } else {
                // Generate new chunk
                console.log('Generating new chunk');
                chunk = this.generator();
            }
            this._map.set(chunkID, chunk);
        }
        return this._map.get(chunkID);
    }

    setBlock (x, y, z, block) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        this.getChunk(chunkX, chunkZ).setBlock(new Vec3(x & 0x0f, y, z & 0x0f), block);
        this.emit('changed', chunkX, chunkZ);
        return this;
    };

    getBlock (x, y, z) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        this.getChunk(chunkX, chunkZ).getBlock(new Vec3(x & 0x0f, y, z & 0x0f));
        this.emit('changed', chunkX, chunkZ);
        return this;
    };

    setType(x, y, z, type) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        this.getChunk(chunkX, chunkZ).setBlockType(new Vec3(x & 0x0f, y, z & 0x0f), type);
        this.emit('changed', chunkX, chunkZ);
        return this;
    }

    getType(x, y, z) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        return this.getChunk(chunkX, chunkZ).getBlockType(new Vec3(x & 0x0f, y, z & 0x0f));
    }

    setAddition(x, y, z, type) {
        // const chunkX = x >> 4;
        // const chunkZ = z >> 4;
        // this.getChunk(chunkX, chunkZ).setAddition(x & 0x0f, y, z & 0x0f, type);
        // this.emit('changed', chunkX, chunkZ);
        return this;
    }


    setLightBlock(x, y, z, light) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        this.getChunk(chunkX, chunkZ).setBlockLight(new Vec3(x & 0x0f, y, z & 0x0f), light);
        this.emit('changed', chunkX, chunkZ);
        return this;
    }

    getLightBlock(x, y, z) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        return this.getChunk(chunkX, chunkZ).getBlockLight(new Vec3(x & 0x0f, y, z & 0x0f));
    }

    setLightSky(x, y, z, light) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        this.getChunk(chunkX, chunkZ).setSkyLight(new Vec3(x & 0x0f, y, z & 0x0f), light);
        this.emit('changed', chunkX, chunkZ);
        return this;
    }

    getLightSky(x, y, z) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        return this.getChunk(chunkX, chunkZ).getSkyLight(new Vec3(x & 0x0f, y, z & 0x0f));
    }


    setBiome(x, z, biome) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        this.getChunk(chunkX, chunkZ).setBiome(new Vec3(x & 0x0f, 0, z & 0x0f), biome);
        this.emit('changed', chunkX, chunkZ);
        return this;
    }

    getBiome(x, z) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        return this.getChunk(chunkX, chunkZ).getBiome(new Vec3(x & 0x0f, 0, z & 0x0f));
    }

}