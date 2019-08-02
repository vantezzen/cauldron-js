import Vec3 from 'vec3'
import ChunkGen from 'prismarine-chunk'
import tumult from 'tumult'

export default function generation({
    version,
    seed = 'Cauldron.JS'
} = {}) {
    const Chunk = ChunkGen(version)
    const noise = new tumult.Perlin2(seed)

    function generateChunk(chunkX, chunkZ) {
        const chunk = new Chunk()
        
        for (let x = 0; x < 16; x++) {
            for (let z = 0; z < 16; z++) {
                let height = Math.round(Math.abs(noise.gen((chunkX * 16 + x) / 100, (chunkZ * 16 + z) / 100)) * 5);
                if (height > 200) {
                    height = 200;
                }

                const dirtHeight = Math.floor(height * (2 / 3));
                const grassHeight = height;

                // Generate bedrock layer
                chunk.setBlockType(new Vec3(x, 0, z), 7)
                // Generate stone layer
                for (let y = 1; y < dirtHeight; y++) {
                    chunk.setBlockType(new Vec3(x, y, z), 1)
                }
                // Generate dirt layer
                for (let y = dirtHeight; y < grassHeight; y++) {
                    chunk.setBlockType(new Vec3(x, y, z), 3)
                }
                // Generate grass layer
                chunk.setBlockType(new Vec3(x, grassHeight, z), 2)

                for (let y = 0; y < 256; y++) {
                    chunk.setSkyLight(new Vec3(x, y, z), 15)
                }
            }
        }
        return chunk
    }
    return generateChunk
}