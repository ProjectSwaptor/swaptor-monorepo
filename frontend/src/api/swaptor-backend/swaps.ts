import axios from "axios";

import { BACKEND_URL } from "@/environment";
import { CreateSwapArgs, UpdateSwapState } from "@/types";
import { executeAsync } from "../wrappers";
import { GetSwapDto } from "@/constants/blockchain/types";
import { SupportedChain } from "@/constants";

type GetSwaps = Array<CreateSwapArgs>;

export const createSwap = async (args: CreateSwapArgs) => {
  return await executeAsync(
    async () => await axios.post(`${BACKEND_URL}/swaps`, args)
  );
};

export const getSwap = async (id: string) => {
  return await executeAsync(
    async () => await axios.get<GetSwapDto>(`${BACKEND_URL}/swaps/${id}`)
  );
};

export const getSwapsForAddress = async (address: string) => {
  return await executeAsync(
    async () =>
      await axios.get<GetSwaps>(`${BACKEND_URL}/swaps/?seller=${address}`)
  );
};

type OracleBlockchainTime = { chain: SupportedChain; time: string };

export const getBlockchainTime = async (chain: SupportedChain) => {
  return await executeAsync(
    async () =>
      await axios.get<OracleBlockchainTime>(
        `${BACKEND_URL}/chains/${chain}/time`
      )
  );
};

export const updateSwapState = async (id: string, transactionHash: string) => {
  return await executeAsync(
    async () =>
      await axios.patch<UpdateSwapState>(
        `${BACKEND_URL}/swaps/${id}/update-state`,
        { transactionHash }
      )
  );
};
