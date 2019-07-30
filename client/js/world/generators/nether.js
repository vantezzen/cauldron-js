import Vec3 from 'vec3'
import ChunkGen from 'prismarine-chunk'
import rand from 'random-seed'

const seed = 'A';

export default function generation (version) {
  const Chunk = ChunkGen(version)

  function generateChunk (chunkX, chunkZ) {
    const seedRand = rand.create(seed + ':' + chunkX + ':' + chunkZ)
    const chunk = new Chunk()
    for (let x = 0; x < 16; x++) {
      for (let z = 0; z < 16; z++) {
        const bedrockheighttop = 1 + seedRand(4)
        const bedrockheightbottom = 1 + seedRand(4)
        for (let y = 0; y < 128; y++) { // Nether only goes up to 128
          let block
          let data

          if (y < bedrockheightbottom) block = 7
          else if (y < level) block = seedRand(50) === 0 ? 89 : 87
          else if (y > 127 - bedrockheighttop) block = 7

          const pos = new Vec3(x, y, z)
          if (block) chunk.setBlockType(pos, block)
          if (data) chunk.setBlockData(pos, data)
          // Don't need to set light data in nether
        }
      }
    }

    return chunk;
  }
  return generateChunk
}