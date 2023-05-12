import axios from "axios";

import { SupportedChain } from "@/constants";
import { BACKEND_URL } from "@/environment";
import { executeAsync } from "../wrappers";

type Price = { price: string };

export const getNativeCurrencyPrice = async (chain: SupportedChain) => {
  return await executeAsync(
    async () => await axios.get<Price>(`${BACKEND_URL}/chains/${chain}/price`)
  );
};

type BlockchainTime = { chainTime: string };

export const getBlockchainTime = async (chain: SupportedChain) => {
  return await executeAsync(
    async () =>
      await axios.get<BlockchainTime>(`${BACKEND_URL}/chains/${chain}/time`)
  );
};

type Fee = { currency: string; fee: string };

export const getFee = async (chain: SupportedChain) => {
  return await executeAsync(
    async () => await axios.get<Fee>(`${BACKEND_URL}/swaps/${chain}/fee`)
  );
};
