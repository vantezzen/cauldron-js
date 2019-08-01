import Vec3 from 'vec3'

export const event = 'block_place';
export const handle = (event, data, metadata, id, uuid, server) => {
    if (data.location.x == -1 && data.location.y == -1 && data.location.z == -1) {
        // Invalid block placement
        return;
    }
    const directionToVector = [new Vec3(0, -1, 0), new Vec3(0, 1, 0), new Vec3(0, 0, -1), new Vec3(0, 0, 1), new Vec3(-1, 0, 0), new Vec3(1, 0, 0)]
    const referencePosition = new Vec3(data.location.x, data.location.y, data.location.z)
    const directionVector = directionToVector[data.direction]
    const placedPosition = referencePosition.plus(directionVector)

    server.writeAll('block_change', {
        location: placedPosition,
        type: data.heldItem.blockId << 4 | data.heldItem.itemDamage,
    })

    server.world.world.setBlock(placedPosition.x, placedPosition.y, placedPosition.z, {
        type: data.heldItem.blockId,
        metadata: data.heldItem.itemDamage
    })
    // data.heldItem.blockId << 4 | data.heldItem.itemDamage
}