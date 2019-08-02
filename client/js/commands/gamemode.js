export const command = 'gamemode';
export const handle = (command, components, id, uuid, server) => {
    if (components.length !== 1) {
        server.sendMessage(id, 'Usage: /gamemode [gamemode]')
        return;
    }

    let [ gamemode ] = components

    if (gamemode != Number(gamemode)) {
        if (gamemode === 'survival') {
            gamemode = 0;
        } else if (gamemode === 'creative') {
            gamemode = 1;
        } else if (gamemode === 'adventure') {
            gamemode = 2;
        } else if (gamemode === 'spectator') {
            gamemode = 3;
        } else {
            server.sendMessage(id, 'Invalid gamemode')
            return;
        }
    } else if (gamemode > 3) {
        server.sendMessage(id, 'Invalid gamemode')
        return;
    }

    server.write(id, 'game_state_change', {
        reason: 3,
        gameMode: gamemode
    })
}