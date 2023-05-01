import { transformChainToHex } from "../swaps/swaps.utils";
import { Chain } from "./common.constants";
import { SWAP_ID_LENGTH } from "../swaps/swaps.constants";

export const isPositiveNumberString = (data: string) => /^[0-9]\d*$/.test(data);

export const isUUID = (data: string) =>
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/.test(
    data
  );

export const isSwapId = (data: string) =>
  data.length === SWAP_ID_LENGTH && /^[a-zA-Z0-9_-]+$/.test(data);

export const isPositiveInteger = (data: string) => /^[1-9]\d*$/.test(data);

export const isTransactionHash = (data: string) =>
  /^0x([A-Fa-f0-9]{64})$/.test(data);

export const isChainIdSupported = (data: string) => {
  const chainIdHex = transformChainToHex(data);

  return Object.values(Chain).includes(chainIdHex);
};
