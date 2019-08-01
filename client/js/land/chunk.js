import Block from './block'
import Biome from './biome'

const BlockTypeName = [];
for (let name in Block) {
    BlockTypeName[Block[name]] = name;
}

export default class Chunk {
    constructor() {
        this._block = Buffer.alloc(16 * 256 * 16, 0);
        this._addition = Buffer.alloc(16 * 128 * 16, 0);        
        this._lightBlock = Buffer.alloc(16 * 128 * 16, 0);
        this._lightSky = Buffer.alloc(16 * 128 * 16, 0);
        this._meta = Buffer.alloc(16 * 128 * 16, 0);
        this._bioms = Buffer.alloc(16 * 16, 0);
    }

    setType(x, y, z, value) {
        value = isNaN(value) ? Block[value] : +value;
        this._block.writeUInt8(value, x | (z << 4) | (y << 8));
    }

    getType(x, y, z) {
        const value = this._block.readUInt8(x | (z << 4) | (y << 8));
        return BlockTypeName[value] || value;
    }

    setAddition(x, y, z, value) {
        const index = x | (z << 4) | (y << 8);

        if (index % 2) {            
            this._addition[index>>>1] &= 0xf0;
            this._addition[index>>>1] |= (value & 0x0f);
        } else {
            this._addition[index>>>1] &= 0x0f;
            this._addition[index>>>1] |= ((value << 4) & 0xf0);
        }
    }

    setLightBlock(x, y, z, value) {
        const index = (x | (z << 4) | (y << 8)) >>> 1;

        if (x % 2) {
            this._lightBlock[index] &= 0xf0;
            this._lightBlock[index] |= value & 0x0f;
        } else {
            this._lightBlock[index] &= 0x0f;
            this._lightBlock[index] |= (value << 4) & 0xf0;
        }
    }

    getLightBlock(x, y, z) {
        const index = (x | (z << 4) | (y << 8)) >>> 1;

        if (x % 2) {
            return this._lightBlock[index] & 0x0f;
        } else {
            return (this._lightBlock[index] >> 4) & 0xf0;
        }
    }

    setLightSky(x, y, z, value) {
        const index = (x | (z << 4) | (y << 8)) >>> 1;
        if (x % 2) {
            this._lightSky[index] &= 0xf0;
            this._lightSky[index] |= value & 0x0f;
        } else {
            this._lightSky[index] &= 0x0f;
            this._lightSky[index] |= (value << 4) & 0xf0;
        }
    }

    getLightSky(x, y, z) {
        const index = (x | (z << 4) | (y << 8)) >>> 1;

        if (x % 2) {
            return this._lightSky[index] & 0x0f;
        } else {
            return (this._lightSkyp[index] >> 4) & 0xf0;
        }
    }

    setBiome(x, z, value) {
        value = isNaN(value) ? Biome[value] : +value;
        this._bioms.writeUInt8(value, x | (z << 4));
    }

    getBiome(x, z) {
        return this._bioms.readUInt8(x | (z << 4));
    }

    raw() {
        
    }
}