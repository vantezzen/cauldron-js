const nbt = require('prismarine-nbt')
const {promisify} = require("es6-promisify")
const zlib = require('zlib')
const AnvilFS = require('./fs').default
const fs = new AnvilFS;

function write (nbtData, cb) {
  const data = nbt.writeUncompressed(nbtData)
  zlib.gzip(data, cb)
}

const parseAsync = promisify(nbt.parse)
const writeAsync = promisify(write)

module.exports = {readLevel, writeLevel}

async function readLevel (path) {
  const buffer = fs.readFile(path, fs.stat(path).size, 0)
  const content = buffer.toString();
  const dnbt = await parseAsync(content)
  return nbt.simplify(dnbt).Data
}

async function writeLevel (path, value) {
  const nbt = {
    'type': 'compound',
    'name': '',
    'value': {
      'Data': {
        'type': 'compound',
        'value': {
          'RandomSeed': {
            'type': 'long',
            'value': value['RandomSeed']
          }
        }
      }
    }
  }
  const data = await writeAsync(nbt)
  const buffer = Buffer.alloc(data.length, data)
  fs.writeFile(path, buffer)
}
