import Vec3 from 'vec3'
import ChunkGen from 'prismarine-chunk'

export default function generation (
  version,
  bottomId = 7,
  middleId = 1,
  topId = 2,
  middleThickness = 3,
  debug = false
) {
  const Chunk = ChunkGen(version)

  function generateChunk () {
    const chunk = new Chunk()
    const height = middleThickness + 1
    const DEBUG_POINTS = [new Vec3(0, height, 0), new Vec3(15, height, 0), new Vec3(0, height, 15), new Vec3(15, height, 15)]
    for (let x = 0; x < 16; x++) {
      for (let z = 0; z < 16; z++) {
        for (let y = 0; y < middleThickness + 2; y++) {
          if (y === 0) chunk.setBlockType(new Vec3(x, y, z), bottomId)
          else if (y < middleThickness + 1) chunk.setBlockType(new Vec3(x, y, z), middleId)
          else chunk.setBlockType(new Vec3(x, y, z), topId)
        }
        for (let y = 0; y < 256; y++) {
          chunk.setSkyLight(new Vec3(x, y, z), 15)
        }
      }
    }

    if (debug) {
      DEBUG_POINTS.forEach(p => chunk.setBlockType(p, 35))
    }
    return chunk
  }
  return generateChunk
}
