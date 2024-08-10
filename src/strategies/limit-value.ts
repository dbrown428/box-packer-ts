import { EitherAsync, Left } from "purify-ts";
import { Box, Item, PackingResult } from "../types";

/**
 * Limit Box Value
 * Given items and boxes, find the optimal packing solution that limits the value
 * of each box to $X, if possible.
 */
export function limitBoxValue(boxSizes: Box[], items: Item[], value: number): EitherAsync<string, PackingResult> {
  
  // TODO: Requires add $ value to boxes.
  // if value of item is over box limit, then pack anyway
  // if value of items is over box limit, but packing

  return EitherAsync.liftEither(Left("TODO:"));
}
