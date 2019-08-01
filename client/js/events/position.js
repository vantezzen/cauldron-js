export const event = 'position';

export const handle = (event, data, metadata, id, uuid, server) => {
    // Update position in database
    server.db.players.update(uuid, {
        x: data.x,
        y: data.y,
        z: data.z,
        onGround: data.onGround
    })
    // Send new position to other players
    server.writeOthers(id, 'entity_teleport', {
        entityId: id,
        x: data.x,
        y: data.y,
        z: data.z,
        onGround: data.onGround
    })
    // Send current chunk to player
    const chunkX = data.x >> 4;
    const chunkZ = data.z >> 4;
    const distance = 2;
    for (let x = chunkX - distance; x < chunkX + distance; x++) {
        for (let z = chunkZ - distance; z < chunkZ + distance; z++) {
            const chunkId = `${x}:${z}`;
            if (!server.clientChunks.get(id).has(chunkId)) {
                server.clientChunks.get(id).add(chunkId)
                const chunk = server.world.land.getChunk(x, z);
                server.world.sendChunk(id, x, z, chunk.dump())
            }
        }
    }
}