/**
 * Cauldron.js - Minecraft Server in your browser
 *
 * commands/index.js - Combining command handlers
 *
 * @version     0.1.0
 * @copyright   Copyright vantezzen (https://github.com/vantezzen)
 * @link        https://github.com/vantezzen/cauldron-js
 * @license     https://opensource.org/licenses/mit-license.php MIT License
 */
import * as ping from './ping'
import * as tp from './tp'
import * as motd from './motd'
import * as gamemode from './gamemode'

export default [
  ping,
  tp,
  motd,
  gamemode
]
