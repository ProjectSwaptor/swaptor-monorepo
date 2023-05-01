import { CacheKey } from "../cache/cache.constants";
import { retrieveFromCache } from "../cache/cache.service";
import { Chain } from "../common/common.constants";
import { getLatestPrice, getLatestBlockchainTimestamp } from "./oracles.utils";

export const getNativeCurrencyPrice = async (chain: Chain) => {
  const getLatestValue = () => getLatestPrice(chain);
  const price = await retrieveFromCache(CacheKey.Price, getLatestValue);

  return price;
};

export const getBlockchainTime = async (chainId: Chain) => {
  const getLatestValue = () => getLatestBlockchainTimestamp(chainId);
  const time = await retrieveFromCache(CacheKey.ChainTime, getLatestValue);

  return time;
};
