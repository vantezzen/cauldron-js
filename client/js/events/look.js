export const event = 'look';
export const handle = (event, data, metadata, client, clientIndex, server) => {
    server.db.players.update(client.uuid, {
        yaw: data.yaw,
        pitch: data.pitch
    })
    server.writeOthers(client.id, 'entity_look', {
        entityId: client.id,
        yaw: server.conv(data.yaw),
        pitch: server.conv(data.pitch)
    })
}