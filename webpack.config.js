/**
 * Cauldron.js - Minecraft Server in your browser
 * 
 * Configuration for webpack for the frontend
 * 
 * @version     0.1.0
 * @copyright   Copyright vantezzen (https://github.com/vantezzen)
 * @link        https://github.com/vantezzen/cauldron-js
 * @license     https://opensource.org/licenses/mit-license.php MIT License
 */
const path = require('path')

module.exports = {
  entry: ['./client/js/main'],
  mode: 'development',
  output: {
    path: path.join(__dirname, 'client/dist'),
    filename: 'bundle.js'
  },
  devtool: 'source-map'
}