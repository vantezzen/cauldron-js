export const command = 'ping';
export const handle = (command, components, id, uuid, server) => {
    server.sendMessage(id, 'Pong');
}