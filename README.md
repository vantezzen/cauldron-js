<p align="center">
    <img src="client/icon.png" height="300"><br />
</p>

# Cauldron.js - Minecraft Server in your browser

`Cauldron.js` allows you to run a minecraft server mainly from your browser.

It still uses a NodeJS backend server that hosts the minecraft server but all work will be performed inside the browser.

## Why?
By moving all processing and memory intensive work to the browser, `Cauldron.js` can be hosted on minimal server hardware while still allowing possibly hundreds of minecraft servers to be runnning on a single server.

## Why not?
Tl:dr: Don't actually use CauldronJS to play Minecraft with your friends.

1. Moving all processes into the browser requires the whole server code to be rewritten. 

    This is why `Cauldron.js` is still very bare-bones, having only a few elemental features and serving as a proof-of-concept.

2. Moving all processes into the browser also slows down all actions (a lot!).

    This results in actions sometimes needing up to a few seconds to get to the other clients, depending on the load.

3. `Cauldron.js` saves all game data (worlds etc.) inside IndexedDB. This limits the storage availible to 5MB on most mobile devices and up to 20GB on desktops with large hard drives, resulting in the size of the map being limited.

## Usage
Try a demo of `Cauldron.js` on <https://cauldron.vantezzen.io> or [install it on your own server](#Installation).

## Installation

1. Clone this project
   ```
   git clone https://github.com/vantezzen/cauldron-js.git
   ```
2. Use `yarn` to install its dependecies
   ```
   yarn install
   ```
3. Start the server
   ```
   yarn start
   ```
4. Open the webpage in your browser (`127.0.0.1:3000` by default, the port will be printed in the console)
5. You will now see your minecraft server IP and port. Connect to the server in your minecraft client.

## Environment variables
When starting `Cauldron.js` you can set the following environment variables:
- DEBUG : Debug level for the NodeJS `debug` module (only for backend)
- LOCATION : IP/domain the servers are availible at. If no supplied, `Cauldron.js` will use the NodeJS `ip` module to get the current server IP.

## Developing
`Cauldron.js` uses Webpack to bundle its frontend. Please open a new terminal and run `yarn watch` to start webpack and listen for changes.

`Cauldron.js` uses the following folder structure:
```
/
    client/     // Client/frontend files
        dist/   // Files generated by webpack
        js/     // Main server files
    index.js    // Backend server
```

When developing `Cauldron.js` you might want to change its debug behaviour. `Cauldron.js` uses the npm `debug` module to debug both the front- and backend. To change the backend debug behaviour, set the `DEBUG` [environment variable](#Environment-variables), to change the frontend debug behaviour, set `localStorage.debug`. 

All of `Cauldron.js`'s modules will debug into the `cauldron:*` channel.


Before creating a PR, please make sure to lint your code by running `yarn lint`.
[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

## Why no 1.14 support?
`Cauldron.js` uses the `prismarine-chunk` library to create, save, dump and load chunks for the current world. Unfortunately, `prismarine-chunk` is not yet compatible with Minecraft 1.14.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)