import { Box, BoxManifest, Item, PackingResult } from "../types"

const BinPacking3D = require('binpackingjs').BP3D
const { Packer, Item: PackItem, Bin: PackBin } = BinPacking3D

/**
 * Pack is a wrapper around BinPackingJS.
 * 
 * Note:
 * - It will only work with the boxes given, eg. it will not add more boxes if needed
 * - It will not optimize packing solutions, eg. it will not use fewer boxes
 * - It will not minimize box size for items
 * 
 * It's possible that some items cannot be packed due to constraints, make sure
 * to check the 'unfitItems' in the results.
 * 
 * @param availableBoxes   the box sizes available for packing
 * @param items            the items to be packed
 */
export default function pack(availableBoxes: Box[], items: Item[]): PackingResult {
  // Instantiate the expected BinPackingJS objects.
  const internalBins = availableBoxes.map(instantiateBinType)
  const internalItems = items.map(instantiateItemType)

  // Packer will mutate the bins passed to it, therefore no function output 
  // from packer.pack
  const packer = new Packer()
  internalBins.forEach(bin => packer.addBin(bin))
  internalItems.forEach(item => packer.addItem(item))
  packer.pack()

  // Helper functions
  const keepBinsWithItems = (bin: typeof PackBin) => bin.items.length > 0
  const itemIdentifier = (item: typeof PackItem) => item.name

  // These items were packed in the provided box sizes.
  const manifests: BoxManifest[] = packer.bins
    .filter(keepBinsWithItems)
    .map(createBoxManifest)

  // These items could not be packed in any of the provided box sizes.  
  const unfitItemIds: string[] = packer
    .unfitItems
    .map(itemIdentifier)

  return { manifests, unfitItemIds }
}

function instantiateBinType(box: Box) {
  return new PackBin(
    box.id,
    box.width,
    box.height,
    box.length,
    box.maxWeight,
  )
}

function instantiateItemType(item: Item) {
  return new PackItem(
    item.id,
    item.width,
    item.height,
    item.length,
    item.weight,
  )
}

/**
 * Create a box manifests from the packed bin.
 */
function createBoxManifest(bin: typeof PackBin): BoxManifest {
  const sumVolume = (result: number, i: typeof PackItem) => 
    result + unfactorVolume(i)
  const totalItemVolume = bin
    .items
    .reduce(sumVolume, 0)
  const boxVolume = unfactorVolume(bin)
  const remainingVolume = (boxVolume - totalItemVolume)

  return {
    id: bin.name,
    items: bin.items.map((i: typeof PackItem) => i.name),
    remainingVolume,
  }
}

/**
 * Must unfactor each dimension before calculating.
 */
function unfactorVolume(a: typeof PackItem | typeof PackBin) {
  return unfactorInteger(a.width)
    * unfactorInteger(a.height)
    * unfactorInteger(a.depth);
} 

/** 
 * BinpackingJS applies a factor to each number as it's passed in, I'm not 
 * certain, but it might be for simplifying floating point calculations so
 * only integers are used.
 */
function unfactorInteger(value: number): number {
  return Math.round(value / ( 10 ** 5 ))
}
