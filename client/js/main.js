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

// Current MCServer instance
let server;

// Set default debugging level
if (!localStorage.debug) {
  localStorage.setItem('debug', 'cauldron:*')
  Debugger.enable('cauldron:*')
}

// Create debugger for server
const debug = Debugger('cauldron:main');
debug('Cauldron.JS - Minecraft Server in your browser.\nSource code availible at https://github.com/vantezen/cauldron-js');


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
  server.handleEvent(event, data, metadata, id)
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

// Start server using given settings
const startServer = (version, motd, generator, seed) => {
  document.getElementById('start-server').style.display = 'none';
  document.getElementById('server-starting').style.display = 'block';

  // Tell backend to start new proxy server
  socket.emit('create server', version, motd, (ip) => {
    if (ip === 0) {
      debug('Error while starting server: Got response', ip);

      // Error while creating server
      document.getElementById('server-error').style.display = 'block';
      document.getElementById('server-starting').style.display = 'none';
      return;
    }
    debug('Started MC Server proxy on IP', ip);

    // Get major version number
    if (version.split('.').length === 3) {
      version = version.split('.').slice(0,2).join('.')
    }

    // Setup MC Server
    server = new MCServer(socket, version, db, generator, seed);

    // Show server online page with IP
    document.getElementById('server-online').style.display = 'block';
    document.getElementById('server-starting').style.display = 'none';
    document.getElementById('ip').innerText = ip;
  });
}

// Test if settings already saved => Start automatically
if (localStorage.getItem('setting.version')) {
  const version = localStorage.getItem('setting.version');
  const motd = localStorage.getItem('setting.motd');
  const generator = localStorage.getItem('setting.generator');
  const seed = localStorage.getItem('setting.seed');

  debug('Auto-Starting MC Server with data:', version, motd, generator, seed)

  startServer(version, motd, generator, seed);
} else {
  document.getElementById('start-server').style.display = 'block';
}

// Listen for click on start server button
document.getElementById('start').addEventListener('click', () => {
  const version = document.getElementById('version').value;
  const motd = document.getElementById('motd').value;
  const generator = document.getElementById('generator').value;
  const seed = document.getElementById('seed').value || String(Math.random());

  // Save settings in localStorage
  localStorage.setItem('setting.version', version)
  localStorage.setItem('setting.motd', motd)
  localStorage.setItem('setting.generator', generator)
  localStorage.setItem('setting.seed', seed)

  debug('Starting MC Server with data:', version, motd, generator, seed)
  
  startServer(version, motd, generator, seed);
});

// Listen for click on change settings/stop server button
document.getElementById('stop').addEventListener('click', () => {
  server.stop();

  document.getElementById('version').value = localStorage.getItem('setting.version');
  document.getElementById('motd').value = localStorage.getItem('setting.motd');
  document.getElementById('generator').value = localStorage.getItem('setting.generator');
  document.getElementById('seed').value = localStorage.getItem('setting.seed');

  document.getElementById('start-server').style.display = 'block';
  document.getElementById('with-configured').style.display = 'block';
  document.getElementById('server-online').style.display = 'none';
})

// Listen for server delete
document.getElementById('delete').addEventListener('click', (() => {
  document.getElementById('start-server').style.display = 'none';
  document.getElementById('server-delete').style.display = 'block';

  // Delete all data
  indexedDB.deleteDatabase('world');
  indexedDB.deleteDatabase('Minecraft');
  indexedDB.deleteDatabase('__dbnames');
  localStorage.clear();

  // Wait 2 seconds for deletion to complete
  setTimeout(() => {
    location.reload();
  }, 2000);
}).bind(window))