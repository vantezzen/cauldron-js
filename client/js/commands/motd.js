export const command = 'motd'
export const info = 'Change the MOTD of your server'
export const usage = '/motd [Text]'
export const handle = (command, components, client, clientIndex, server) => {
  if (components.length < 1) {
    server.sendMessage(client.id, 'Usage: ' + usage)
    return
  }

  const motd = components.join(' ')

  console.log(motd)

  server.socket.emit('motd', motd)
  server.sendMessage(client.id, 'MOTD updated')
}
