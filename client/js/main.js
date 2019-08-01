/**
 * Cauldron.js - Minecraft Server in your browser
 * 
 * main.js - Entry point for frontend
 * 
 * @version     0.1.0
 * @copyright   Copyright vantezzen (https://github.com/vantezzen)
 * @link        https://github.com/vantezzen/cauldron-js
 * @license     https://opensource.org/licenses/mit-license.php MIT License
 */
import io from 'socket.io-client';
import Debugger from 'debug'
import {
  openDatabase
} from './storage'
import MCServer from './mc-server'
// import AnvilFS from './anvil/fs'

// Current MCServer instance
let server;

// Create debugger for server
const debug = Debugger('cauldron:main');

// Set default debugging level
if (!localStorage.debug) {
  localStorage.debug = 'cauldron:*'
}

// Open database
const db = openDatabase();

// Setup socket connection
const socket = io();
socket.on('connect', () => {
  debug('Connected socket to server with ID of', socket.io.engine.id)
})

// Listen for new client login
socket.on('login', client => {
  debug('New client connected with ID of', client.id);

  server.newClient(client);
})

// Listen for minecraft client events
socket.on('event', (event, data, metadata, id, uuid) => {
  server.handleEvent(event, data, metadata, id, uuid)
})

// Listen for minecraft connection end
socket.on('client disconnected', (client, reason) => {
  server.handleDisconnect(client, reason);
})

// Helper function: Dump Dexie database to console
window.dumpDB = async () => {
  db.tables.forEach(function (table, i) {
    var primKeyAndIndexes = [table.schema.primKey].concat(table.schema.indexes);
    var schemaSyntax = primKeyAndIndexes.map(function (index) {
      return index.src;
    }).join(',');
    console.log('Table dump: ', table.name, schemaSyntax);
    table.each(function (object) {
      console.log(object);
    });
  });
};
// Helper function: Dump file names in filesystem
window.dumpFS = () => {
  const BrowserFS = require('browserfs')
  BrowserFS.configure({
      fs: "LocalStorage"
  }, ((e) => {
  if (e) {
      console.error('BrowserFS error:', e);
      return;
  }
      const fs = BrowserFS.BFSRequire('fs');
      const stats = fs.statSync('/', false)
      console.log(stats);

      const files = fs.readdirSync('/overworld', false)
      console.log(files);

      for (const file of files) {
        const content = fs.readFileSync('/overworld/' + file);
        console.log(file, ':', content);
      }
  }));
  
}

// window.fs = new AnvilFS;
// window.Buffer = Buffer;

// Listen for server start
document.getElementById('start').addEventListener('click', () => {
  const version = document.getElementById('version').value;
  const motd = document.getElementById('motd').value;

  debug('Starting MC Server with data:', version, motd)

  document.getElementById('start-server').style.display = 'none';
  document.getElementById('server-starting').style.display = 'block';

  socket.emit('create server', version, motd, (ip) => {
    if (ip === 0) {
      debug('Error while starting server: Got response', ip);

      // Error while creating server
      document.getElementById('server-error').style.display = 'block';
      document.getElementById('server-starting').style.display = 'none';
      return;
    }
    debug('Started MC Server proxy on IP', ip);

    // Setup MC Server
    server = new MCServer(socket, version, db);

    document.getElementById('server-online').style.display = 'block';
    document.getElementById('server-starting').style.display = 'none';
    document.getElementById('ip').innerText = ip;
  });
});