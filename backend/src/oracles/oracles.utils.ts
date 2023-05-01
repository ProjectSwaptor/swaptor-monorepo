import { ethers } from "ethers";

import { ChainlinkPriceFeed } from "./oracles.contracts";
import { CHAIN_TO_RPC, Chain } from "../common/common.constants";

export const getLatestBlockchainTimestamp = async (chain: Chain) => {
  const rpc = CHAIN_TO_RPC[chain];
  const provider = new ethers.providers.JsonRpcProvider(rpc);

  const blockNumber = await provider.getBlockNumber();
  const { timestamp } = await provider.getBlock(blockNumber);

  return timestamp;
};

export const getLatestPrice = async (chain: Chain) => {
  const priceFeed = await ChainlinkPriceFeed.getPriceFeed(chain);
  const [, currentPrice, , ,] = await priceFeed.latestRoundData();

  return currentPrice;
};
