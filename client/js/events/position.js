import Vec3 from 'vec3'

export const event = 'position';

export const handle = (event, data, metadata, client, clientIndex, server) => {
    // Get previous position
    const prev = {
        ...server.clients[clientIndex].position
    };

    // Update position in database and client list
    const update = {
        x: data.x,
        y: data.y,
        z: data.z,
        onGround: data.onGround
    }
    server.db.players.update(client.uuid, update)
    server.clients[clientIndex].position = {
        ...server.clients[clientIndex].position,
        ...update
    }

    const position = new Vec3(data.x, data.y, data.z);
    const lastPosition = new Vec3(prev.x, prev.y, prev.z)
    const diff = position.minus(lastPosition)

    const maxDelta = 3;

    // if (diff.abs().x > maxDelta || diff.abs().y > maxDelta || diff.abs().z > maxDelta) {
        // Teleport player to new position
        const entityPosition = position.scaled(32).floored()
        server.writeOthers(client.id, 'entity_teleport', {
            entityId: client.id,
            x: entityPosition.x,
            y: entityPosition.y,
            z: entityPosition.z,
            onGround: data.onGround
        })
    // } else if (diff.distanceTo(new Vec3(0, 0, 0)) !== 0) {
    //     // Move player relative to current position
    //     const delta = diff.scaled(32).floored()

    //     server.writeOthers(client.id, 'rel_entity_move', {
    //         entityId: client.id,
    //         dX: delta.x,
    //         dY: delta.y,
    //         dZ: delta.z,
    //         onGround: data.onGround
    //     })
    // }
    // Send current chunk to player
    server.world.sendNearbyChunks(data.x, data.z, client.id)
}