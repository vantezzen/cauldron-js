export const event = 'position_look';
export const handle = (event, data, metadata, client, clientIndex, server) => {
    const update = {
        x: data.x,
        y: data.y,
        z: data.z,
        yaw: data.yaw,
        pitch: data.pitch,
        onGround: data.onGround
    }
    server.db.players.update(client.uuid, update)
    server.clients[clientIndex].position = {
        ...server.clients[clientIndex].position,
        ...update
    }
    
    server.writeOthers(client.id, 'entity_teleport', {
        entityId: client.id,
        x: data.x,
        y: data.y,
        z: data.z,
        yaw: server.conv(data.yaw),
        pitch: server.conv(data.pitch),
        onGround: data.onGround
    })
}