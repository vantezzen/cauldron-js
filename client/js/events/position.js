export const event = 'position';
export const handle = (event, data, metadata, id, uuid, server) => {
    server.db.players.update(uuid, {
        x: data.x,
        y: data.y,
        z: data.z,
        onGround: data.onGround
    })
    server.writeOthers(id, 'entity_teleport', {
        entityId: id,
        x: data.x,
        y: data.y,
        z: data.z,
        onGround: data.onGround
    })
}