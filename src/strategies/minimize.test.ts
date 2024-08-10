
import { minimizeBoxesUsed } from '..'
import { Box, Item, PackingResult } from '../types'

describe('Minimize Boxes Used', () => {
  test('No items', async () => {
    expect.assertions(1)
    const box1 = new Box('123', 5, 10, 10, 10)
    const boxes: Box[] = [box1]
    const expected: PackingResult = { manifests: [], unfitItemIds: [] }
    return minimizeBoxesUsed(boxes, [])
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })
  
  test('No boxes', async () => {
    expect.assertions(1)
    const item1 = new Item('abc', 20, 30, 10, 1)
    const items = [item1]
    const expected: PackingResult = {
      manifests: [],
      unfitItemIds: ['abc']
    }
    return minimizeBoxesUsed([], items)
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })

  test('No boxes fit', async () => {
    expect.assertions(1)
    const item1 = new Item('abc', 20, 30, 10, 1)
    const box1 = new Box('123', 5, 10, 10, 10)
    const box2 = new Box('456', 10, 20, 10, 10)
    
    const boxes: Box[] = [box1, box2]
    const items: Item[] = [item1]
    const expected: PackingResult = {
      manifests: [],
      unfitItemIds: [item1.id],
    }
    return minimizeBoxesUsed(boxes, items)
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })
  
  test('Item fits', async () => {
    expect.assertions(1)
    const item1 = new Item('abc', 20, 30, 10, 1)
    const box1 = new Box('123', 20, 30, 10, 10)
    
    const boxes: Box[] = [box1]
    const items: Item[] = [item1]
    const expected: PackingResult = {
      manifests: [
        { id: box1.id, items: [item1.id], remainingVolume: 0 },
      ],
      unfitItemIds: [],
    }
    return minimizeBoxesUsed(boxes, items)
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })

  test('Smallest box for item', async () => {
    expect.assertions(1)
    const item = new Item('def', 10, 20, 10, 1)
    const box1 = new Box('123', 50, 30, 10, 10)
    const box2 = new Box('456', 10, 20, 10, 10)
    const box3 = new Box('789', 30, 20, 10, 10)
    const box4 = new Box('000', 15, 20, 15, 10)
    const box5 = new Box('111', 10, 10, 10, 10)
    
    const boxes: Box[] = [box1, box2, box3, box4, box5]
    const items: Item[] = [item]
    const expected: PackingResult = {
      manifests: [{ id: box2.id, items: [item.id], remainingVolume: 0 }],
      unfitItemIds: [],
    }
    return minimizeBoxesUsed(boxes, items)
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })

  test('Item does not fit in first box', async () => {
    expect.assertions(1)
    const item1 = new Item('abc', 20, 30, 10, 1)
    const box1 = new Box('123', 20, 30, 10, 10)
    const box2 = new Box('456', 50, 30, 5, 10)
    
    const boxes: Box[] = [box1, box2]
    const items: Item[] = [item1]
    const expected: PackingResult = {
      manifests: [
        { id: box1.id, items: [item1.id], remainingVolume: 0 },
      ],
      unfitItemIds: [],
    }
    return minimizeBoxesUsed(boxes, items)
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })

  test('Many items per box', async () => {
    expect.assertions(1)
    const item0 = new Item('ccc', 10, 10, 10, 1)
    const item1 = new Item('abc', 20, 20, 10, 1)
    const item2 = new Item('def', 20, 20, 10, 1)
    const item3 = new Item('ghi', 20, 20, 10, 1)
    const box1 = new Box('012', 40, 20, 10, 10)   // two items
    const box2 = new Box('123', 20, 20, 10, 10)

    const boxes: Box[] = [box1, box2]
    const items: Item[] = [item1, item2, item3, item0]
    const expected: PackingResult = {
      manifests: [
        { id: box1.id, items: [item1.id, item2.id], remainingVolume: 0 },
        { id: box1.id, items: [item3.id, item0.id], remainingVolume: 3000 },
      ],
      unfitItemIds: [],
    }
    return minimizeBoxesUsed(boxes, items)
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })

  test('Largest boxes are packed first', async () => {
    expect.assertions(1)
    const item1 = new Item('abc', 20, 20, 10, 1)
    const item2 = new Item('def', 40, 20, 10, 1)
    const box1 = new Box('456', 20, 20, 10, 10)
    const box2 = new Box('123', 40, 20, 10, 10)

    const boxes: Box[] = [box1, box2]
    const items: Item[] = [item2, item1]
    const expected: PackingResult = {
      manifests: [
        { id: box2.id, items: [item2.id], remainingVolume: 0 },
        { id: box1.id, items: [item1.id], remainingVolume: 0 },
      ],
      unfitItemIds: [],
    }
    return minimizeBoxesUsed(boxes, items)
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })

  test('Order of items - 1', async () => {
    expect.assertions(1)
    const item1 = new Item('abc', 20, 20, 10, 1)
    const item2 = new Item('def', 20, 20, 10, 1)
    const item3 = new Item('hij', 40, 20, 10, 1)

    const box1 = new Box('123', 20, 20, 10, 10)
    const box2 = new Box('456', 40, 20, 10, 10)

    const boxes: Box[] = [box1, box2]
    const items: Item[] = [item1, item2, item3]
    const expected: PackingResult = {
      manifests: [
        { id: box2.id, items: [item3.id], remainingVolume: 0 },
        { id: box2.id, items: [item1.id, item2.id], remainingVolume: 0 },
      ],
      unfitItemIds: [],
    }
    return minimizeBoxesUsed(boxes, items)
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })

  test('Order of items - 2', async () => {
    expect.assertions(1)
    const item1 = new Item('abc', 20, 20, 10, 1)
    const item2 = new Item('def', 40, 20, 10, 1)
    const item3 = new Item('hij', 20, 20, 10, 1)

    const box1 = new Box('123', 20, 20, 10, 10)
    const box2 = new Box('456', 40, 20, 10, 10)

    const boxes: Box[] = [box1, box2]
    const items: Item[] = [item1, item2, item3]
    const expected: PackingResult = {
      manifests: [
        { id: box2.id, items: [item2.id], remainingVolume: 0 },
        { id: box2.id, items: [item1.id, item3.id], remainingVolume: 0 },
      ],
      unfitItemIds: [],
    }
    return minimizeBoxesUsed(boxes, items)
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })

  test('Order of items - 3', async () => {
    expect.assertions(1)
    const item1 = new Item('abc', 20, 20, 10, 1)
    const item2 = new Item('def', 20, 20, 10, 1)
    const item3 = new Item('hij', 20, 20, 10, 1)
    const item4 = new Item('nop', 40, 20, 10, 1)
    
    const box1 = new Box('123', 20, 30, 10, 10)
    const box2 = new Box('456', 20, 20, 10, 10) 
    const box3 = new Box('789', 30, 30, 10, 10)
    const box4 = new Box('012', 40, 20, 10, 10)

    const boxes: Box[] = [box1, box2, box3, box4]
    const items: Item[] = [item1, item2, item3, item4]
    const expected: PackingResult = {
      manifests: [
        { id: box4.id, items: [item4.id], remainingVolume: 0 },
        { id: box4.id, items: [item1.id, item2.id], remainingVolume: 0 },
        { id: box2.id, items: [item3.id], remainingVolume: 0 },
      ],
      unfitItemIds: [],
    }
    return minimizeBoxesUsed(boxes, items)
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })

  // Imagine a long poster tube box trying to fit an item that's wider
  test('Irregular large volume box holds fewer items than a smaller volume box', async () => {
    expect.assertions(1)
    const item1 = new Item('abc', 20, 20, 10, 1)
    const item2 = new Item('def', 20, 20, 10, 1)
    const box1 = new Box('789', 30, 30, 10, 10)   // one item
    const box2 = new Box('012', 40, 20, 10, 10)   // two items

    const boxes: Box[] = [box1, box2]
    const items: Item[] = [item1, item2]
    const expected: PackingResult = {
      manifests: [
        { id: box2.id, items: [item1.id, item2.id], remainingVolume: 0 },
      ],
      unfitItemIds: [],
    }
    return minimizeBoxesUsed(boxes, items)
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })

  test('Not all items fit', async () => {
    expect.assertions(1)
    const item1 = new Item('abc', 20, 30, 10, 1)
    const item2 = new Item('def', 10, 20, 10, 1)
    const box1 = new Box('123', 5, 10, 10, 10)
    const box2 = new Box('456', 10, 20, 10, 10)
    
    const boxes: Box[] = [box1, box2]
    const items: Item[] = [item1, item2]
    const expected: PackingResult = {
      manifests: [{ id: box2.id, items: [item2.id], remainingVolume: 0 }],
      unfitItemIds: [item1.id],
    }
    return minimizeBoxesUsed(boxes, items)
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })

  test('Minimize boxes used', async () => {
    expect.assertions(1)
    const item1 = new Item('abc', 20, 30, 10, 1)
    const item2 = new Item('def', 20, 20, 10, 1)
    const box1 = new Box('123', 20, 30, 10, 10)  // Fits item1 OR item2
    const box2 = new Box('456', 20, 20, 10, 10)  // Fits item2
    const box3 = new Box('789', 20, 30, 20, 10)  // Fits item1 AND item2

    const boxes: Box[] = [box1, box2, box3]
    const items: Item[] = [item1, item2]
    const expected: PackingResult = {
      manifests: [{ id: box3.id, items: [item1.id, item2.id], remainingVolume: 2000 }],
      unfitItemIds: [],
    }
    return minimizeBoxesUsed(boxes, items)
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })

  test('Many items fit into several boxes', async () => {
    expect.assertions(1)
    const item1 = new Item('abc', 20, 20, 10, 1)
    const item2 = new Item('def', 20, 20, 10, 1)
    const item3 = new Item('hij', 20, 20, 10, 1)

    const box1 = new Box('123', 20, 30, 10, 10)
    const box2 = new Box('456', 20, 20, 10, 10)  // one item
    const box3 = new Box('789', 30, 30, 10, 10)
    const box4 = new Box('012', 40, 20, 10, 10)   // two items

    const boxes: Box[] = [box1, box2, box3, box4]
    const items: Item[] = [item1, item2, item3]
    const expected: PackingResult = {
      manifests: [
        { id: box4.id, items: [item1.id, item2.id], remainingVolume: 0 },
        { id: box2.id, items: [item3.id], remainingVolume: 0 },
      ],
      unfitItemIds: [],
    }
    return minimizeBoxesUsed(boxes, items)
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })
  
  test('Many items fit into several boxes - 2', async () => {
    expect.assertions(1)
    const item1 = new Item('abc', 20, 20, 10, 1)
    const item2 = new Item('def', 20, 20, 10, 1)
    const item3 = new Item('hij', 20, 20, 10, 1)
    const item4 = new Item('klm', 20, 20, 10, 1)
    const item5 = new Item('nop', 20, 20, 10, 1)
    const item6 = new Item('qrs', 20, 20, 10, 1)

    const box1 = new Box('123', 20, 30, 10, 10)
    const box2 = new Box('456', 20, 20, 10, 10)
    const box3 = new Box('789', 30, 30, 10, 10)
    const box4 = new Box('012', 40, 20, 10, 10)   // two items x 3 boxes

    const boxes: Box[] = [box1, box2, box3, box4]
    const items: Item[] = [item1, item2, item3, item4, item5, item6]
    const expected: PackingResult = {
      manifests: [
        { id: box4.id, items: [item1.id, item2.id], remainingVolume: 0 },
        { id: box4.id, items: [item3.id, item4.id], remainingVolume: 0 },
        { id: box4.id, items: [item5.id, item6.id], remainingVolume: 0 },
      ],
      unfitItemIds: [],
    }
    return minimizeBoxesUsed(boxes, items)
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })
  
  test('Many items fit into several boxes - 3', async () => {
    expect.assertions(1)
    const item1 = new Item('abc', 20, 20, 10, 1)
    const item2 = new Item('def', 10, 10, 10, 1)
    const item3 = new Item('hij', 20, 20, 10, 1)
    const item4 = new Item('klm', 10, 10, 10, 1)
    const item5 = new Item('nop', 20, 20, 10, 1)
    const item6 = new Item('qrs', 10, 10, 10, 1)

    const box1 = new Box('123', 20, 30, 10, 10)
    const box2 = new Box('456', 20, 20, 10, 10)
    const box3 = new Box('789', 30, 30, 10, 10)
    const box4 = new Box('012', 40, 20, 10, 10)

    const boxes: Box[] = [box1, box2, box3, box4]
    const items: Item[] = [item1, item2, item3, item4, item5, item6]
    const expected: PackingResult = {
      manifests: [
        { id: box3.id, items: [item1.id, item2.id, item4.id, item6.id], remainingVolume: 2000 },
        { id: box4.id, items: [item3.id, item5.id], remainingVolume: 0 },
      ],
      unfitItemIds: [],
    }
    return minimizeBoxesUsed(boxes, items)
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })

  test('Many iterations of packing multiple boxes', async () => {
    expect.assertions(1)
    const item1 = new Item('abc', 20, 20, 10, 1)
    const item2 = new Item('def', 20, 20, 10, 1)
    const item3 = new Item('hij', 20, 20, 10, 1)
    const item4 = new Item('klm', 30, 20, 10, 1)
    const item5 = new Item('nop', 40, 20, 10, 1)
    const item6 = new Item('qrs', 5, 10, 5, 1)

    const box1 = new Box('123', 20, 30, 10, 10)
    const box2 = new Box('456', 20, 20, 10, 10)
    const box3 = new Box('789', 30, 30, 10, 10)
    const box4 = new Box('012', 40, 20, 10, 10)

    const boxes: Box[] = [box1, box2, box3, box4]
    const items: Item[] = [item1, item2, item3, item4, item5, item6]
    const expected: PackingResult = {
      manifests: [
        { id: box3.id, items: [item4.id, item6.id], remainingVolume: 2750 },
        { id: box4.id, items: [item5.id], remainingVolume: 0 },
        { id: box4.id, items: [item1.id, item2.id], remainingVolume: 0 },
        { id: box2.id, items: [item3.id], remainingVolume: 0 },
      ],
      unfitItemIds: [],
    }
    return minimizeBoxesUsed(boxes, items)
      .then(results => results.map(r => expect(r).toEqual(expected)))
  })
})

describe('Limit box packed value', () => {
  test('', async () => {
    
  })
})
