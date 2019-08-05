/**
 * Cauldron.js - Minecraft Server in your browser
 *
 * storage.js - Manage dexie storage
 *
 * @version     0.1.0
 * @copyright   Copyright vantezzen (https://github.com/vantezzen)
 * @link        https://github.com/vantezzen/cauldron-js
 * @license     https://opensource.org/licenses/mit-license.php MIT License
 */
import Dexie from 'dexie'
import Debugger from 'debug'
const debug = Debugger('cauldron:storage')

export const openDatabase = () => {
  // Create database using Dexie
  const db = new Dexie('Minecraft')
  db.version(1).stores({
    players: 'uuid, x, y, z, yaw, pitch, onGround'
  })

  debug('Opened database')

  return db
}
