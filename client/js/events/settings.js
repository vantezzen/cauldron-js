export const event = 'settings';

export const handle = (event, data, metadata, id, uuid, server) => {
    server.clientSettings[id] = data;
}