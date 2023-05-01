import { ethers } from "ethers";

import * as PriceFeedJSON from "../abis/AggregatorV3Interface.json";
import * as SwaptorJSON from "../abis/Swaptor.json";
import { AggregatorV3Interface } from "./types/contracts/src/v0.8/interfaces";
import { Swaptor } from "./types/contracts/src/v0.8/";
import { CHAIN_TO_PRICE_FEED } from "./oracles.constants";
import { SwaptorChains } from "../common/common.types";
import {
  CHAIN_TO_RPC,
  Chain,
  SWAPTOR_ADDRESSES,
} from "../common/common.constants";

export class ChainlinkPriceFeed {
  private static priceFeeds = new Map<string, AggregatorV3Interface>();

  private constructor() {}

  public static async getPriceFeed(chain: Chain) {
    const priceFeedAddress = CHAIN_TO_PRICE_FEED[chain];
    const priceFeed = ChainlinkPriceFeed.priceFeeds.get(priceFeedAddress);
    const rpcProvider = new ethers.providers.JsonRpcProvider(
      CHAIN_TO_RPC[chain]
    );

    if (!priceFeed) {
      const priceFeed = new ethers.Contract(
        priceFeedAddress,
        PriceFeedJSON.abi,
        rpcProvider
      ) as AggregatorV3Interface;

      ChainlinkPriceFeed.priceFeeds.set(priceFeedAddress, priceFeed);

      return priceFeed;
    }

    return priceFeed;
  }
}

export const getLatestFee = async (chain: SwaptorChains) => {
  const swaptorAddress = SWAPTOR_ADDRESSES[chain];
  const rpc = CHAIN_TO_RPC[chain];

  const rpcProvider = new ethers.providers.JsonRpcProvider(rpc);

  const swaptor = new ethers.Contract(
    swaptorAddress,
    SwaptorJSON.abi,
    rpcProvider
  ) as Swaptor;

  return (await swaptor.feeInUsd()).toString();
};
