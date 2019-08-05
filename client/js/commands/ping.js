export const command = 'ping'
export const info = 'Ping - Pong'
export const usage = '/ping'
export const handle = (command, components, client, clientIndex, server) => {
  server.sendMessage(client.id, 'Pong')
}
