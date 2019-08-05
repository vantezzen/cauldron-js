import ItemLoader from 'prismarine-item'
import WindowLoader from 'prismarine-windows'

export default function pluginInventory (server) {
  const Item = ItemLoader(server.version)
  const windows = WindowLoader(server.version).windows

  server.event.addHandler('login', (event, data, metadata, client, clientIndex, server) => {
    server.clients[clientIndex].heldItemSlot = 0
    server.clients[clientIndex].heldItem = new Item(256, 1)
    server.clients[clientIndex].inventory = new windows.InventoryWindow(0, 'Inventory', 44)
  })

  server.event.addHandler('held_item_slot', (event, data, metadata, client, clientIndex, server) => {
    server.clients[clientIndex].heldItemSlot = data.slotId
    server.clients[clientIndex].heldItem = client.inventory.slots[36 + data.slotId]

    server.writeOthers(client.id, 'entity_equipment', {
      entityId: client.id,
      slot: 0,
      item: Item.toNotch(server.clients[clientIndex].heldItem)
    })
  })

  server.event.addHandler('set_creative_slot', (event, data, metadata, client, clientIndex, server) => {
    if (data.item.blockId === -1) {
      server.clients[clientIndex].inventory.updateSlot(data.slot, undefined)
      return
    }

    const newItem = Item.fromNotch(data.item)
    server.clients[clientIndex].inventory.updateSlot(data.slot, newItem)
  })
}
