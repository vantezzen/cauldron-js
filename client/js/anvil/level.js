const nbt = require('prismarine-nbt')
const {promisify} = require("es6-promisify")
const zlib = require('zlib')
const BrowserFS = require('browserfs')

let fs;

BrowserFS.configure({
  fs: "LocalStorage",
}, function (e) {
  if (e) {
    throw e;
  }
  fs = BrowserFS.BFSRequire('fs');
});

function write (nbtData, cb) {
  const data = nbt.writeUncompressed(nbtData)
  zlib.gzip(data, cb)
}

const parseAsync = promisify(nbt.parse)
const writeAsync = promisify(write)

module.exports = {readLevel, writeLevel}

async function readLevel (path) {
  const content = fs.readFileSync(path)
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
  fs.writeFileSync(path, data)
}
