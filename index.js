/**
 * Cauldron.js - Minecraft Server in your browser
 *
 * @version     0.1.0
 * @copyright   Copyright vantezzen (https://github.com/vantezzen)
 * @link        https://github.com/vantezzen/cauldron-js
 * @license     https://opensource.org/licenses/mit-license.php MIT License
 */
// Import libraries
const chalk = require('chalk')
const express = require('express')
const http = require('http')
const mc = require('minecraft-protocol')
const path = require('path')
const ip = require('ip')
const debug = require('debug')('cauldron:backend')

// Display welcome message
console.log(chalk.cyan('Cauldron.js - Minecraft Server in your browser'))

// Setup express server
const app = express()
app.use(express.static(path.join(__dirname, '/client')))
const server = http.createServer(app)
// HTTP server routes
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/client/index.html'))
})

// Setup socket.io server
const io = require('socket.io')(server, {
  cookie: false
})

const servers = {} // List of minecraft servers and clients connected
let nextPort = 25500 // Port used for next server
const availiblePorts = [] // Ports that are lower than `port` but are availible again

const stopServer = (id, reason) => {
  // Disconnect all clients and show custom message
  Object.keys(servers[id].server.clients).forEach(clientId => {
    const client = servers[id].server.clients[clientId]
    client.end(reason)
  })

  // Close server
  servers[id].server.close()

  // Make port availible for next server
  availiblePorts.push(servers[id].port)
  delete servers[id]
  debug('Server stopped, opening port for new server')
}

io.on('connection', socket => {
  debug('New socket connection')

  // Create new minecraft proxy server
  socket.on('create server', (version, motd, callback) => {
    // Only create one server per socket
    if (servers[socket.id]) callback(0) // eslint-disable-line

    // Get availible port for current server
    let port
    if (availiblePorts.length > 0) {
      port = availiblePorts.shift()
    } else {
      port = nextPort
      nextPort++
    }

    // Setup minecraft proxy server
    const mcserver = mc.createServer({
      'online-mode': false,
      encryption: true,
      port,
      version,
      motd
    })

    // Add server to servers list
    servers[socket.id] = {
      server: mcserver,
      socket,
      port,
      clients: {}
    }

    // Proxy all calls to the browser via socket.io
    mcserver.on('login', client => {
      servers[socket.id].clients[client.id] = client

      client.on('packet', (data, metadata) => {
        if (metadata.name) {
          socket.emit('event', metadata.name, data, metadata, client.id, client.uuid)
        }
      })
      client.on('end', reason => {
        socket.emit('client disconnected', client.id, reason)
      })
      socket.emit('login', client)
    })
    debug('Started new MC proxy server on port ' + port)

    // Inform client about new server IP
    const location = process.env.LOCATION || ip.address()
    callback(`${location}:${port}`) // eslint-disable-line
  })

  // Write a packet to a minecraft client
  socket.on('write', (client, type, data) => {
    if (servers[socket.id] &&
      servers[socket.id].clients[client] &&
      servers[socket.id].clients[client].write) {
      servers[socket.id].clients[client].write(type, data)
    }
  })

  socket.on('stop', () => {
    if (servers[socket.id]) {
      stopServer(socket.id, 'You stopped the server. Please restart the server to continue playing.')
    }
  })

  // Stop proxy server when socket disconnected
  socket.on('disconnect', () => {
    if (servers[socket.id]) {
      stopServer(socket.id, 'You closed your browser tab - this will stop your Minecraft server. Please reopen the tab to restart your server.')
    }
  })
})

// Start express server
const expressport = process.env.PORT || 3000
server.listen(expressport, function () {
  console.log(`Webserver listening on port ${expressport}`)
})
