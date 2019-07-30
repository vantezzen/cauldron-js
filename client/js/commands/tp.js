export const command = 'tp';
export const handle = (command, components, id, uuid, server) => {
    if (components.length !== 3) {
        server.sendMessage(id, 'Usage: /tp [x] [y] [z]')
        return;
    }

    const [ x, y, z ] = components

    server.write(id, 'position', {
        x,
        y,
        z,
        yaw: 0,
        pitch: 0,
        flags: 0x00
    })
    server.writeOthers(id, 'named_entity_spawn', {
        entityId: id,
        playerUUID: uuid,
        type: 'player',
        x,
        y,
        z,
        yaw: 0,
        pitch: 0,
        currentItem: 0,
        metadata: []
    })    
}