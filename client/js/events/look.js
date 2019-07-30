export const event = 'look';
export const handle = (event, data, metadata, id, uuid, server) => {
    server.db.players.update(uuid, {
        yaw: data.yaw,
        pitch: data.pitch
    })
    server.writeOthers(id, 'entity_look', {
        entityId: id,
        yaw: server.conv(data.yaw),
        pitch: server.conv(data.pitch)
    })
}