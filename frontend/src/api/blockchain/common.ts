import { ethers } from "ethers";

import { CHAIN_TO_RPC, SupportedChain } from "@/constants";
import { executeAsync } from "../wrappers";

export const getChainTime = async (chain: SupportedChain) => {
  const rpc = CHAIN_TO_RPC[chain];
  const provider = new ethers.providers.JsonRpcProvider(rpc);

  return await executeAsync(async () => {
    const blockNumber = await provider.getBlockNumber();
    const { timestamp } = await provider.getBlock(blockNumber);

    return timestamp;
  });
};
