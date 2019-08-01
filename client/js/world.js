import spiralloop from 'spiralloop'

import Land from './land'
import Debugger from 'debug'
const debug = Debugger('cauldron:mc-world')

export default class MCWorld {
    constructor(version, server) {
        this.land = new Land(version);
        this.server = server;

        debug('Constructed new MCWorld');
    }

    sendChunk(playerId, x, z, chunk) {
        this.server.write(playerId, 'map_chunk', {
            x: x,
            z: z,
            groundUp: true,
            bitMap: 0xffff,
            primary_bitmap: 65535,
            add_bitmap: 65535,
            chunkData: chunk,
            blockEntities: []
        })
    }
}