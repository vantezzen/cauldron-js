// import uuid from 'uuid'

export const event = 'block_dig'
export const handle = (event, data, metadata, client, clientIndex, server) => {
  if (client.gameMode === 1 || data.status === 2) {
    // Get block that has been dug
    server.world.getBlock(data.location.x, data.location.y, data.location.z)
      .then(block => {
        if (block) {
          // TODO: Spawn object
        }
      })

    server.writeAll('block_change', {
      location: data.location,
      type: 0
    })
    server.world.setBlock(data.location.x, data.location.y, data.location.z, {
      type: 0
    })
  }
}
