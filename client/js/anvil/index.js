// import Chunk from './chunk'
import Block from './block'
import events from 'events'
import ChunkLoader from 'prismarine-chunk'
import Vec3 from 'vec3'
import Generator from '../world/generators/grass'

const EventEmitter = events.EventEmitter

export default class World extends EventEmitter {
    constructor(version) {
        super();
        this._map = new Map();
        this.version = version;
        this.generator = Generator(this.version)
        this.Chunk = ChunkLoader(version)
    }

    forEachChunk(fn) {
        this._initializer = fn;
        return this;
    }

    getChunk(chunkX, chunkZ) {
        const chunkID = `${chunkX}:${chunkZ}`;
        if (!this._map.has(chunkID)) {
            const chunk = this.generator();
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