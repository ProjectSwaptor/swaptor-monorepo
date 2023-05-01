import { SwapType } from "../swaps.constants";

export interface CreateSwapDto {
  id: string;
  signature: string;
  swapType: SwapType;
  seller: string;
  buyer: string;
  offeredTokenAddress: string;
  offeredTokenData: string;
  wantedTokenAddress: string;
  wantedTokenData: string;
  chainId: string;
  expirationTime: string;
}
