import Vec3 from 'vec3'

export const event = 'position';

export const handle = (event, data, metadata, id, uuid, server) => {
    server.db.players.get(uuid, prev => {
        // Update position in database
        server.db.players.update(uuid, {
            x: data.x,
            y: data.y,
            z: data.z,
            onGround: data.onGround
        })

        if (prev) {
            const position = new Vec3(data.x, data.y, data.z);
            const lastPosition = new Vec3(prev.x, prev.y, prev.z)
            const diff = position.minus(lastPosition)

            if (diff.abs() < 8) {
                // Move player relative to current position
                // const delta = diff.scaled(32).floored()

                server.writeOthers(id, 'rel_entity_move', {
                    entityId: id,
                    dX: diff.x,
                    dY: diff.y,
                    dZ: diff.z,
                    onGround: data.onGround
                })
            } else {
                // Teleport player to new position
                server.writeOthers(id, 'entity_teleport', {
                    entityId: id,
                    x: data.x,
                    y: data.y,
                    z: data.z,
                    onGround: data.onGround
                })
            }
        } else {
            // Teleport player to new position
            server.writeOthers(id, 'entity_teleport', {
                entityId: id,
                x: data.x,
                y: data.y,
                z: data.z,
                onGround: data.onGround
            })
        }
    })
    
    // Send current chunk to player
    const chunkX = data.x >> 4;
    const chunkZ = data.z >> 4;
    // Chunk radius to send to client, based on view distance but max. 3
    const distance = server.clientSettings[id] 
                     && server.clientSettings[id].viewDistance 
                     && server.clientSettings[id].viewDistance < 3 ? server.clientSettings[id].viewDistance : 3;
    for (let x = chunkX - distance; x < chunkX + distance; x++) {
        for (let z = chunkZ - distance; z < chunkZ + distance; z++) {
            const chunkId = `${x}:${z}`;
            if (!server.clientChunks.get(id).has(chunkId)) {
                server.clientChunks.get(id).add(chunkId)
                server.world.getChunk(x, z).then(chunk => {
                    server.world.sendChunk(id, x, z, chunk.dump())
                });
            }
        }
    }
}