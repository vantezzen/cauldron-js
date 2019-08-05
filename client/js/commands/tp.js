export const command = 'tp'
export const info = 'Teleport yourself'
export const usage = '/tp [x] [y] [z]'
export const handle = (command, components, client, clientIndex, server) => {
  if (components.length !== 3) {
    server.sendMessage(client.id, 'Usage: ' + usage)
    return
  }

  const [x, y, z] = components

  server.write(client.id, 'position', {
    x,
    y,
    z,
    yaw: 0,
    pitch: 0,
    flags: 0x00
  })
  server.writeOthers(client.id, 'entity_teleport', {
    entityId: client.id,
    x,
    y,
    z,
    onGround: false
  })
}
