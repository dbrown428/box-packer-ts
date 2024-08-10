import { Box, Item } from '../types'
import pack from './pack'

/**
 * These tests were originally written to help me understand how to use 
 * BinPackingJS and explore it's capabilities.
 */
describe('Packer', () => {
  test('No boxes to pack', () => {
    const item1 = new Item('abc', 20, 30, 10, 1)
    const boxes: Box[] = []
    const items: Item[] = [item1]
    const results = pack(boxes, items)
    const expected = {
      manifests: [],
      unfitItemIds: [item1.id]
    }
    expect(results).toEqual(expected)
  })
  
  test('No items to pack', () => {
    const box1 = new Box('123', 20, 20, 10, 10)
    const boxes: Box[] = [box1]
    const items: Item[] = []
    const results = pack(boxes, items)
    const expected = {
      manifests: [],
      unfitItemIds: []
    }
    expect(results).toEqual(expected)
  })

  test('Item does not fit in box', () => {
    const item1 = new Item('abc', 20, 30, 10, 1)
    const box1 = new Box('123', 20, 20, 10, 10)
    const boxes: Box[] = [box1]
    const items: Item[] = [item1]
    const results = pack(boxes, items)
    const expected = {
      manifests: [],
      unfitItemIds: [item1.id]
    }
    expect(results).toEqual(expected)
  })

  test('Item fits in box', () => {
    const item = new Item('abc', 20, 30, 10, 1)
    const box1 = new Box('123', 20, 20, 10, 10)
    const box2 = new Box('456', 20, 30, 20, 10)
    const boxes: Box[] = [box1, box2]
    const items: Item[] = [item]
    const results = pack(boxes, items)
    const expected = {
      manifests: [{ id: box2.id, items: [item.id], remainingVolume: 6000 }],
      unfitItemIds: []
    }
    expect(results).toEqual(expected)
  })
  
  test('Rotated item fits in box', () => {
    const item = new Item('abc', 10, 20, 20, 1)
    const box1 = new Box('123', 20, 20, 10, 10)
    const box2 = new Box('456', 20, 30, 20, 10)
    const boxes: Box[] = [box1, box2]
    const items: Item[] = [item]
    const results = pack(boxes, items)
    const expected = {
      manifests: [{ id: box1.id, items: [item.id], remainingVolume: 0 }],
      unfitItemIds: []
    }
    expect(results).toEqual(expected)
  })

  test('Multiple items fit in box', () => {
    const item1 = new Item('abc', 10, 20, 20, 1)
    const item2 = new Item('def', 10, 20, 20, 1)
    const box = new Box('abc', 20, 30, 20, 10)
    const boxes: Box[] = [box]
    const items: Item[] = [item1, item2]
    const results = pack(boxes, items)
    const expected = {
      manifests: [{ id: box.id, items: [item1.id, item2.id], remainingVolume: 4000 }],
      unfitItemIds: []
    }
    expect(results).toEqual(expected)
  })

  test('Too many items, no boxes added', () => {
    const item1 = new Item('abc', 20, 20, 10, 1)
    const item2 = new Item('def', 20, 20, 10, 1)
    const box1 = new Box('123', 20, 20, 10, 10)
    const boxes: Box[] = [box1]
    const items: Item[] = [item1, item2]
    const results = pack(boxes, items)
    const expected = {
      manifests: [
        { id: box1.id, items: [item1.id], remainingVolume: 0 },
      ],
      unfitItemIds: [item2.id]
    }
    expect(results).toEqual(expected)
  })

  test('Box ids do NOT need to be unique', () => {
    const item = new Item('abc', 20, 30, 10, 1)
    const box = new Box('123', 20, 30, 20, 10)
    const boxes: Box[] = [box, box]
    const items: Item[] = [item, item, item]
    const results = pack(boxes, items)
    const expected = {
      manifests: [
        { id: box.id, items: [item.id, item.id], remainingVolume: 0 },
        { id: box.id, items: [item.id], remainingVolume: 6000 },
      ],
      unfitItemIds: []
    }
    expect(results).toEqual(expected)
  })

  test('Item exceeds max weight for box', () => {
    const item1 = new Item('abc', 10, 20, 10, 11)
    const box = new Box('123', 20, 30, 20, 10)
    const boxes: Box[] = [box]
    const items: Item[] = [item1]
    const results = pack(boxes, items)
    const expected = {
      manifests: [],
      unfitItemIds: [item1.id]
    }
    expect(results).toEqual(expected)
  })

  test('Many items exceed max weight for box', () => {
    const item1 = new Item('abc', 20, 30, 10, 6)
    const item2 = new Item('def', 20, 30, 10, 6)
    const box = new Box('123', 20, 30, 20, 10)
    const boxes: Box[] = [box]
    const items: Item[] = [item1, item2]
    const results = pack(boxes, items)
    const expected = {
      manifests: [{ id: box.id, items: [item1.id], remainingVolume: 6000 }],
      unfitItemIds: [item2.id]
    }
    expect(results).toEqual(expected)
  })

  test('Does not minimize boxes used', () => {
    const item1 = new Item('abc', 20, 30, 10, 1)
    const item2 = new Item('def', 20, 20, 10, 1)
    const box1 = new Box('123', 20, 30, 10, 10) // Fits item1 OR item2
    const box2 = new Box('456', 20, 20, 10, 10) // Fits item2
    const box3 = new Box('789', 20, 30, 20, 10) // Fits item1 AND item2
    const boxes: Box[] = [box1, box2, box3]
    const items: Item[] = [item1, item2]
    const results = pack(boxes, items)
    const expected = {
      manifests: [
        { id: box2.id, items: [item2.id], remainingVolume: 0 },
        { id: box1.id, items: [item1.id], remainingVolume: 0 },
        // Ideal solution: { id: box3.id, items: [item1.id, item2.id] },
      ],
      unfitItemIds: []
    }
    expect(results).toEqual(expected)
  })
})
