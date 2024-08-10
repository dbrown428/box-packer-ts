
# Box Packer

Pack physical items in boxes. The goal is to minimize the number of boxes used and minimize wasted space in each box. No one likes receiving a massive box with a tiny item inside — it's wasteful.

This is a thin wrapper around the [BinPackingJS](https://www.npmjs.com/package/binpackingjs) package. It primarily adds a simple packing strategy on top, smooths over a few oddities with the original library, and adds crude type support. This code was only used for packing small quantities of items (less than 10), therefore the algorithms are not optimized for efficiency at this time.

The code was used to estimate shipping costs for [Brown Hockey](https://www.brownhockey.com/), and has been pulled from that project. In it's current state, the code is not ready to be used as a standalone package.

<br />

## Getting Started
1. Clone the repository
2. Install the dependencies, `yarn install`
3. Run tests `yarn test`

<br />

## Usage

1. Define all of the box sizes you use in your shipping department.
2. Specify all the items you want to pack.
3. Choose a packing strategy: `minimizeBoxesUsed` or `limitBoxValue` (TODO).
4. Use the packing result for shipping quotes, to help guide human packers, etc.

<br />

#### Define a Box

Define the box dimensions and the maximum weight it can carry. It is currently assumed that each box you define, you have an unlimited supply of.

Units are not enforced, so pick a unit of measure and be consistent with using it for boxes and items. *The internal and external box dimensions are considered the same at this time.*

```typescript
const box = new Box(id, length, width, height, maxWeight);
// const box = new Box('corrugated_34x24x12', 34, 24, 12, 4);
```

If you have have many box sizes to choose from in your operation, then define all sizes, for example:

```typescript
const boxSizes = [
  new Box('123', 20, 30, 10, 10),
  new Box('456', 20, 20, 10, 10),
  new Box('789', 30, 30, 10, 10),
  new Box('012', 40, 20, 10, 10),
];
```

The box sizes will probably stay the same for most packing operations. In my experience, it's not often box sizes changed because we always ordered the same box sizes from vendors.

<br />


#### Items to Pack

Specify the dimensions and weight of the item you want to pack. For an irregular item, you need to determine the smallest cubic size you can comfortably and consistently pack that item.

```typescript
const item = new Item(id, length, width, height, weight);
// const item = new Item('unique-item-id', 10, 6, 9, 1);
```

Specify all the items you need to pack. Most often a single order will have multiple items that need to be packed, for example:

```typescript
const items = [
  new Item('abc', 20, 20, 10, 1),
  new Item('def', 20, 20, 10, 1),
  new Item('hij', 20, 20, 10, 1),
  new Item('klm', 20, 20, 10, 1),
  new Item('nop', 20, 20, 10, 1),
];
```

<br />


#### Choose a Packing Strategy

Currently this code only offers a complete implementation of the `minimizeBoxesUsed` strategy. Pass in your box sizes and items.

```typescript
const packingResult = minimizeBoxesUsed(boxSizes, items)
```

This can be a long running function depending on how many box sizes you have and the quantity of items that need to be packed. 
<!-- Go into more detail about durations for various quantities -->

<br />

#### Results

The packing result contains a list of box manifests and items that could not be packed.

```typescript
type PackingResult = {
  manifests: BoxManifest[]
  unfitItemIds: ItemId[]
}
```

There is minimal information, at this time, about the box manifest.
<!-- TODO: update the items type, add box weight, dimensions… etc -->

```typescript
type BoxManifest = {
  id: BoxId
  items: ItemId[]
  remainingVolume: number
}
```

<br />

## Tests

Unit tests cover the strategies, and they also cover my basic understanding of the BinPackingJS package to show where it was falling short of my needs. To run unit tests:

```typescript
yarn test
```

To generate test coverage reports, use:
```typescript
yarn coverage
```

<br />


## TODO:
- remove PurifyTs, use promises for package.
- restructure code for publishing to npm

