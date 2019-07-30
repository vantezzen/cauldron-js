export const event = 'position_look';
export const handle = (event, data, metadata, id, uuid, server) => {
    server.db.players.update(uuid, {
        x: data.x,
        y: data.y,
        z: data.z,
        yaw: data.yaw,
        pitch: data.pitch,
        onGround: data.onGround
    })
    server.writeOthers(id, 'entity_teleport', {
        entityId: id,
        x: data.x,
        y: data.y,
        z: data.z,
        yaw: server.conv(data.yaw),
        pitch: server.conv(data.pitch),
        onGround: data.onGround
    })
}