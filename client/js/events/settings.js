export const event = 'settings'

export const handle = (event, data, metadata, client, clientIndex, server) => {
  server.clientSettings[client.id] = data
}
