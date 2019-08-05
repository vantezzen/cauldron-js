/**
 * Cauldron.js - Minecraft Server in your browser
 *
 * events/index.js - Combining event handlers
 *
 * @version     0.1.0
 * @copyright   Copyright vantezzen (https://github.com/vantezzen)
 * @link        https://github.com/vantezzen/cauldron-js
 * @license     https://opensource.org/licenses/mit-license.php MIT License
 */
import * as look from './look'
import * as positionLook from './position_look'
import * as position from './position'
import * as blockDig from './block_dig'
import * as blockPlace from './block_place'
import * as chat from './chat'
import * as settings from './settings'

export default [
  look,
  positionLook,
  position,
  blockDig,
  blockPlace,
  chat,
  settings
]
