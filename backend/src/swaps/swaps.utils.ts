import { ethers } from "ethers";
import { StatusCodes } from "http-status-codes";

import {
  CHAIN_TO_RPC,
  Chain,
  SWAPTOR_ADDRESSES,
} from "../common/common.constants";
import * as SwaptorJSON from "../abis/Swaptor.json";
import { SwaptorChains } from "../common/common.types";
import { SwaptorEvent } from "./swaps.constants";
import { SwaptorEventParams } from "./types";

export const getSwaptor = (chain: SwaptorChains) => {
  const rpc = CHAIN_TO_RPC[chain];
  const swaptorAddress = SWAPTOR_ADDRESSES[chain];
  const provider = new ethers.providers.JsonRpcProvider(rpc);

  return new ethers.Contract(swaptorAddress, SwaptorJSON.abi, provider);
};

export const getSwaptorEventParams = async <T extends SwaptorEvent>(
  eventName: T,
  transactionHash: string,
  chain: SwaptorChains
): Promise<SwaptorEventParams<T> | void> => {
  const swaptor = getSwaptor(chain);

  const { provider } = swaptor;
  const { logs } = await provider.getTransactionReceipt(transactionHash);

  const swaptorLogs = logs.filter(
    (log) => log.address.toLowerCase() === swaptor.address.toLowerCase()
  );

  for (const log of swaptorLogs) {
    const event = swaptor.interface.parseLog(log);

    if (event.name === eventName) {
      return event.args as unknown as SwaptorEventParams<T>;
    }
  }
};

export const transformChainToHex = (chain: string) =>
  ("0x" + parseInt(chain).toString(16)).toLowerCase() as Chain;
