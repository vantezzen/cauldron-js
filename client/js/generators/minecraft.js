import Vec3 from 'vec3'
import ChunkGen from 'prismarine-chunk'
import NoiseGen from 'noisejs'

// Return true with a given chance
const withChance = chance => {
  return Math.random() < chance
}

/**
 * Generate a cluster of ore at a given coordinate
 *
 * @param {*} x X coordinate to start from
 * @param {*} y Y coordinate to start from
 * @param {*} z Z coordinate to start from
 * @param {*} clusterChance Chance for another block to spawn for clustering
 * @param {*} block Block ID to cluster
 * @param {*} chunk Chunk to cluster to
 */
const generateOreCluster = (x, y, z, clusterChance, block, chunk, dirtHeight) => {
  chunk.setBlockType(new Vec3(x, y, z), block)

  if (withChance(clusterChance) && x < 16) {
    generateOreCluster(x + 1, y, z, clusterChance, block, chunk, dirtHeight)
  }
  if (withChance(clusterChance) && x > 0) {
    generateOreCluster(x - 1, y, z, clusterChance, block, chunk, dirtHeight)
  }

  if (withChance(clusterChance) && y < dirtHeight - 3) {
    generateOreCluster(x, y + 1, z, clusterChance, block, chunk, dirtHeight)
  }
  if (withChance(clusterChance) && y > 1) {
    generateOreCluster(x, y - 1, z, clusterChance, block, chunk, dirtHeight)
  }

  if (withChance(clusterChance) && z < 16) {
    generateOreCluster(x, y, z + 1, clusterChance, block, chunk, dirtHeight)
  }
  if (withChance(clusterChance) && z > 0) {
    generateOreCluster(x, y, z - 1, clusterChance, block, chunk, dirtHeight)
  }
}

const generateTree = (x, y, z, chunk) => {
  // Create trunk
  for (let yOff = 0; yOff < 4; yOff++) {
    chunk.setBlockType(new Vec3(x, y + yOff, z), 17)
  }

  // Create lower leaf layers
  for (let xOff = -2; xOff <= 2; xOff++) {
    for (let zOff = -2; zOff <= 2; zOff++) {
      for (let yOff = 2; yOff <= 3; yOff++) {
        if (
          ((xOff !== 0 || zOff !== 0) &&
            (xOff !== -2 || zOff !== -2) &&
            (xOff !== 2 || zOff !== -2) &&
            (xOff !== -2 || zOff !== 2) &&
            (xOff !== 2 || zOff !== 2)) || withChance(1 / 4)) {
          chunk.setBlockType(new Vec3(x + xOff, y + yOff, z + zOff), 18)
        }
      }
    }
  }

  // Create upper leaf layers
  for (let xOff = -1; xOff <= 1; xOff++) {
    for (let zOff = -1; zOff <= 1; zOff++) {
      for (let yOff = 4; yOff <= 5; yOff++) {
        if (((xOff !== -1 || zOff !== -1) &&
            (xOff !== 1 || zOff !== -1) &&
            (xOff !== -1 || zOff !== 1) &&
            (xOff !== 1 || zOff !== 1)) || (withChance(1 / 4) && yOff !== 5)) {
          chunk.setBlockType(new Vec3(x + xOff, y + yOff, z + zOff), 18)
        }
      }
    }
  }
}

// Generate pond currently not in use as it crashes the server
// const generatePond = (x, y, z, chunk) => {
//   let xMax = Math.floor(Math.random() * 3) + 3
//   let xMin = Math.floor(Math.random() * 3) + 3
//   let zMax = Math.floor(Math.random() * 3) + 3
//   let zMin = Math.floor(Math.random() * 3) + 3

//   if (x + xMax > 15) {
//     xMax = 15 - x
//   }
//   if (x - xMin < 0) {
//     xMin = x
//   }
//   if (z + zMax > 15) {
//     zMax = 15 - z
//   }
//   if (z - zMin < 0) {
//     zMin = z
//   }

//   const pondLength = (xMax - xMin) > (zMax - zMin) ? (xMax - xMin) : (zMax - zMin)

//   for (let xOff = xMin; xOff >= xMax; xOff++) {
//     for (let zOff = zMin; zOff >= zMax; zOff++) {
//       const depth = Math.floor(Math.abs((((xOff + zOff) / 2) / pondLength) - 0.5) * 4)

//       for (let yOff = 0; yOff <= depth; yOff++) {
//         chunk.setBlockType(new Vec3(x + xOff, y - yOff, z + zOff), 9)
//       }
//     }
//   }
// }

export default function generation ({
  version,
  seed = 'Cauldron.JS',
  detalization = 50,
  minHeight = 50,
  maxHeight = 100
} = {}) {
  const Chunk = ChunkGen(version)
  const Noise = new NoiseGen.Noise(seed)
  // const elevation = new tumult.Perlin2(seed + 'elevation')
  // const roughness = new tumult.Perlin2(seed + 'roughness')
  // const detail = new tumult.Perlin2(seed + 'detail')

  function generateNoise (x, z) {
    const noise = (Noise.perlin2(x / detalization, z / detalization) + 1) * 0.5
    const range = maxHeight - minHeight

    return Math.round(noise * range + minHeight)
  }

  function generateChunk (chunkX, chunkZ) {
    const chunk = new Chunk()

    for (let x = 0; x < 16; x++) {
      for (let z = 0; z < 16; z++) {
        let height = generateNoise(chunkX * 16 + x, chunkZ * 16 + z)
        // let height = Math.round(Math.abs(elevation.gen((chunkX * 16 + x) / 100, (chunkZ * 16 + z) / 100) + (roughness.gen((chunkX * 16 + x) / 100, (chunkZ * 16 + z) / 100)) * detail.gen((chunkX * 16 + x) / 100, (chunkZ * 16 + z) / 100) * 16 + 64));
        // let height = Math.round(Math.abs(noise.gen((chunkX * 16 + x) / 100, (chunkZ * 16 + z) / 100))) + 20;
        if (height > 200) {
          height = 200
        } else if (height < 10 || isNaN(height)) {
          height = 10
        }

        const dirtHeight = height - (Math.floor(Math.random() * 6) + 2)
        const grassHeight = height

        // Generate bedrock layer
        chunk.setBlockType(new Vec3(x, 0, z), 7)
        // Generate stone layer
        for (let y = 1; y < dirtHeight; y++) {
          if (chunk.getBlockType(new Vec3(x, y, z)) === 0) {
            chunk.setBlockType(new Vec3(x, y, z), 1)

            // Generate random iron ore clusters
            if (withChance(1 / 512)) {
              generateOreCluster(x, y, z, 1 / 8, 15, chunk, dirtHeight)
            }
            // Generate random diamond ore clusters
            if (y < 20 && withChance(1 / 2048)) {
              generateOreCluster(x, y, z, 1 / 16, 56, chunk, dirtHeight)
            }
          }
        }

        // Generate dirt layer
        for (let y = dirtHeight; y < grassHeight; y++) {
          chunk.setBlockType(new Vec3(x, y, z), 3)
        }
        // Generate grass layer
        chunk.setBlockType(new Vec3(x, grassHeight, z), 2)

        // Generate trees
        if (z < 13 && z > 4 && x < 13 && x > 4 && withChance(1 / 32)) {
          generateTree(x, grassHeight + 1, z, chunk)
        }
        // Generate ponds
        if (z < 13 && z > 4 && x < 13 && x > 4 && withChance(1 / 128)) {
          // generatePond(x, grassHeight, z, chunk);
        }

        for (let y = 0; y < 256; y++) {
          chunk.setSkyLight(new Vec3(x, y, z), 15)
        }
      }
    }
    return chunk
  }
  return generateChunk
}
