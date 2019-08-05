export const command = 'gamemode';
export const info = 'Update your gamemode';
export const usage = '/gamemode [0|1|2|3|survival|creative|adventure|spectator]'
export const handle = (command, components, client, clientIndex, server) => {
    if (components.length !== 1) {
        server.sendMessage(client.id, 'Usage: /gamemode [gamemode]')
        return;
    }

    let [ gameMode ] = components

    if (gameMode != Number(gameMode)) {
        if (gameMode === 'survival') {
            gameMode = 0;
        } else if (gameMode === 'creative') {
            gameMode = 1;
        } else if (gameMode === 'adventure') {
            gameMode = 2;
        } else if (gameMode === 'spectator') {
            gameMode = 3;
        } else {
            server.sendMessage(client.id, 'Invalid gamemode')
            return;
        }
    } else if (gameMode > 3) {
        server.sendMessage(client.id, 'Invalid gamemode')
        return;
    }

    server.clients[clientIndex].gameMode = gameMode

    server.write(client.id, 'game_state_change', {
        reason: 3,
        gameMode
    })
    server.sendMessage(client.id, 'Gamemode updated')
}