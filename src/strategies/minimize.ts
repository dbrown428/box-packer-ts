import { EitherAsync, Right } from 'purify-ts'
import { Box, Item, PackingResult } from '../types'
import pack from '../wrapper/pack'

/**
 * Minimize Boxes Used 
 * 
 * Given items and box sizes, find the optimal packing solutions that minimizes
 * the quantity of boxes used.
 * 
 * This function assumes that you have an unlimited supply of boxes that you 
 * could use for packing. Specify the boxSizes you have in your inventory, and 
 * the items that need to be packed.
 */
export function minimizeBoxesUsed(boxSizes: Box[], items: Item[]): EitherAsync<string, PackingResult> {
  // Box size order is important when finding smaller boxes.
  const boxes: Box[] = boxSizes.sort(byVolumeDescending)

  // TODO: use promise for package
  return EitherAsync(({ liftEither }) => {
    const results = tryPackingBoxes(boxes, items)
    return liftEither(Right(results))
  })
}

type Volume = {
  volume: number
}

function byVolumeDescending<T extends Volume>(a: T, b: T) {
  if (a.volume > b.volume) {
    return -1
  } else {
    return 1
  }
}

/**
 * The worst case scenario for minimizing boxes is the maximum boxes needed 
 * equals the quantity of items.
 * 
 * TODO:
 *  - add items lookup Map for quicker lookups, instead of filtering.
 *  - clean up nested functions here, sloppy to read.
 */
function tryPackingBoxes(boxSizes: Box[], items: Item[]): PackingResult {
  const unfitItemIds = items.map(item => item.id)
  const initialResult: PackingResult = { manifests: [], unfitItemIds }

  // Convenience function for readability.
  const packMore = (previousResult: PackingResult) => {
    const unpackedItems = getItems(items, previousResult.unfitItemIds)
    const result = tryPackingBox(boxSizes, unpackedItems)
  
    return {
      manifests: [...previousResult.manifests, ...result.manifests],
      unfitItemIds: result.unfitItemIds,
    }
  }

  // Only continue packing if there are unfit item ids.
  const packNextBox = (previousResult: PackingResult) => {
    const finishedPacking = previousResult.unfitItemIds.length === 0
  
    if (finishedPacking) {
      return previousResult
    } else {
      return packMore(previousResult)
    }
  }

  return items.reduce(packNextBox, initialResult)
}

/**
 * Keep items that are in the itemIds list.
 * 
 * TODO: use a dict/map for lookups.
 */
function getItems(items: Item[], itemIds: string[]): Item[] {
  return items.filter(item => itemIds.includes(item.id))
}

/**
 * Focus on packing one box
 */
function tryPackingBox(boxSizes: Box[], items: Item[]): PackingResult {
  if (boxSizes.length === 0) {
    return { manifests: [], unfitItemIds: items.map(item => item.id) }
  } else {
    return packBox(boxSizes, items)
  }
}

/**
 * Focus on optimizing the box for the items that do fit. The items that 
 * don't fit are another function's responsibility.
 * 
 * Always try smaller boxes, because the initial packing might be garbage. 
 * eg. largest volume box could be an odd shape (long skinny)
 */
function packBox(boxSizes: Box[], items: Item[]): PackingResult {
  const currentBox = boxSizes[0]

  // The sorted by volume boxes means the next box could be smaller or
  // equal to the current box volume.
  const smallerBoxes = boxSizes.slice(1)
  const hasSmallerBoxes = smallerBoxes.length > 0

  /** 
   * Only pack one box at a time, because the underlying packer does not do
   * a very good job with multiple boxes.
   */
  const result = pack([currentBox], items)

  /** Always try to find a better fitting box for the result */
  if (hasSmallerBoxes) {
    return findSmallerBox(smallerBoxes, items, result)
  } else {
    return result
  }
}

/**
 * Try packing the items in a different set of box sizes, and compare with the
 * previous result for reduced volume or an increased manifest count.
 * 
 * TODO: consider adding volume to the packing result so those values aren't
 *       being calculated each time here.
 */
function findSmallerBox(boxSizes: Box[], items: Item[], previousResult: PackingResult): PackingResult {
  const alternateResult = tryPackingBox(boxSizes, items)
  const alternateFitCount = alternateResult.manifests.length
  const alternateUnfitCount = alternateResult.unfitItemIds.length
  const alternateVolume = remainingVolume(alternateResult)

  const previousFitCount = previousResult.manifests.length
  const previousUnfitCount = previousResult.unfitItemIds.length
  const previousVolume = remainingVolume(previousResult)

  // The alternate box reduces volume, with the same or better manifest counts.
  const reducedVolume = alternateFitCount >= previousFitCount 
    && alternateUnfitCount <= previousUnfitCount
    && alternateVolume < previousVolume
  
  // The alternate box has a better manifest count, with the same or reduced volume.
  const improvedManifest = alternateFitCount > previousFitCount
    && alternateUnfitCount < previousUnfitCount
    && alternateVolume <= previousVolume

  const smallerBoxIsBetter = reducedVolume || improvedManifest
  
  if (smallerBoxIsBetter) {
    return alternateResult
  } else {
    return previousResult
  }
}

/**
 * Sum the remaining volume for each box manifest.
 */
export function remainingVolume(result: PackingResult): number {
  return result.manifests.reduce((result, boxManifest) => result + boxManifest.remainingVolume, 0)
}
