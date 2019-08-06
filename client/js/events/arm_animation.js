export const event = 'arm_animation'
export const handle = (event, data, metadata, client, clientIndex, server) => {
  server.writeOthers('animation', {
    entityId: client.id,
    animation: 0
  })
}
