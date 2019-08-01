export const event = 'block_dig';
export const handle = (event, data, metadata, id, uuid, server) => {
    server.writeAll('block_change', {
        location: data.location,
        type: 0
    })
    server.world.land.setBlock(data.location.x, data.location.y, data.location.z, {
        type: 0
    })
}