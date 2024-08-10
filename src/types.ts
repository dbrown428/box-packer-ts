
/**
 * The ItemId should identify the item related to a specific order. This might
 * be a UUID from a shopping cart. You want to be able to track the customers, such as a barcode, 1, 2, 3, abc… etc.
 * Just need a way to internally identify the item that's going to be packed.
 */
export type ItemId = string

/**
 * All items are assumed to be rectangular in shape to simplify the packing
 * algorithm. For irregular shape items, use the dimensions that you can
 * comfortably pack that item to.
 * 
 * There are no types for dimensions or weight, at this time, so pick a unit,
 * such as cm (centimeters) and kg (kilograms) and use it for both items and
 * boxes.
 */
export class Item {
  constructor(
    readonly id: ItemId,
    readonly length: number,
    readonly width: number,
    readonly height: number,
    readonly weight: number,
  ) { }
}


/**
 * The BoxId should identify the type of box that will be packed, this could
 * be the vendor code for the box, barcode, or an internal identifier.
 * 
 * Examples:
 *  - uline-corrugated_34x24x12
 *  - 123-abc-456-def
 *
 * Just need way to internally identify the box that's going to be packed.
 */
export type BoxId = string

/**
 * The external size of the box and internal size of the box are assumed to be
 * the same (negligable difference). This should be corrected for more accurate
 * shipping and packing.
 * 
 * There are no types for dimensions or weight, at this time, so pick a unit,
 * such as cm (centimeters) and kg (kilograms) and use it for both items and
 * boxes.
 * 
 * TODO:
 *  - consider differentiating between BoxId (inventory pull code) and the 
 *    shipping identifier.
 *  - add empy box weight, also helpful for shipping calculations
 */
export class Box {
  constructor(
    readonly id: BoxId,
    readonly length: number,
    readonly width: number,
    readonly height: number,
    readonly maxWeight: number,
  ) { }
  
  get volume(): number {
    return this.length * this.width * this.height
  }
}

// TODO:
//  Consider differentiating between internal BoxManifest and the final 
//  BoxManifest / result.

/**
 * The contents of the box and how much volume is remaining for packing
 * additional items.
 * 
 * TODO: 
 *  - include the actual items in the box, not just the id.
 *  - include dmensions, weight, max weight… etc.
 *  - this should contain more information for the people packing
 *  - the additional information is helpful for gathering stats on shipping
 */
export type BoxManifest = {
  id: BoxId
  items: ItemId[]
  remainingVolume: number
}

/**
 * Need to add many boxes to the packer (BinPackingJS), it will only use
 * boxes that have been provided.
 */
export type PackingResult = {
  manifests: BoxManifest[]
  unfitItemIds: ItemId[]
}
