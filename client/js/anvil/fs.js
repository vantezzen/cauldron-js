/**
 * Cauldron.js - Minecraft Server in your browser
 * 
 * AnvilFS - Custom localStorage filesystem integration for saving minecraft anvil worlds
 * 
 * @version     0.1.0
 * @copyright   Copyright vantezzen (https://github.com/vantezzen)
 * @link        https://github.com/vantezzen/cauldron-js
 * @license     https://opensource.org/licenses/mit-license.php MIT License
 */
import Debugger from 'debug'
const debug = Debugger('cauldron:anvil-fs')

export default class AnvilFS {
    constructor() {
        debug('Created new AnvilFS');
    }

    /**
     * Read a file from the localStorage filesystem
     * 
     * @param {String} filename Absolute path to the file (always starting with /)
     * @param {Number} length Length of the data that should be returned
     * @param {Number} position Offset from where to start reading
     * @returns {Buffer} Data
     */
    read(filename, length, position) {
        debug('Reading file', filename, length, position);

        if (!localStorage[filename]) {
            const buffer = Buffer.alloc(position + length);
            b.fill(0);
            return buffer;
        }
        const data = Buffer.alloc(position + length, localStorage.getItem(filename))
        const slicedData = data.slice(position, position + length);
        return slicedData
    }

    /**
     * Write data from a buffer into a file in the filesystem
     * 
     * @param {String} filename Absolute path to the file to save to
     * @param {Buffer} buffer Buffer to save into the file
     * @param {Number} position Position from where to start saving the buffer to
     */
    write(filename, buffer, position = 0) {
        debug('Writing file', filename, position);

        let data = '';
        if (localStorage[filename]) {
            data = localStorage.getItem(filename);
        } else {
            for (let i = 0; i < position; i++) {
                data += String.fromCharCode(0);
            }
        }

        while (position > data.length) {
            data += String.fromCharCode(0);
        }
        data = data.slice(0, position) + buffer.toString() + data.slice(position + buffer.length);

        localStorage.setItem(filename, data)
    }

    /**
     * Get basic stats about a file in the filesystem
     * 
     * The returned object contains:
     * {
     *  size - Byte size of the file (0 is not existent or empty)
     * }
     * 
     * @param {String} filename Absolute path to a file
     * @returns {Object} Stats about the file
     */
    stat(filename) {
        debug('Getting stats for file', filename);

        const data = localStorage.getItem(filename);

        let size = 0;
        if (data) {
            size = data.length
        }

        return {
            size
        }
    }
}