import { SwaptorChains } from "./common.types";

export const ONE_SECOND = 1000;
export const SIGNATURE_LENGTH = 132;
export const DEFAULT_FIAT_CURRENCY = "USD";

export enum Chain {
  Ethereum = "0x1",
  Polygon = "0x89",
  Avalanche = "0xa86a",
  Mumbai = "0x13881",
}

export enum Currency {
  Ether = "ether",
  Matic = "matic",
  Avax = "avax",
}

export const CHAIN_TO_CURRENCY: Record<Chain, Currency> = {
  [Chain.Ethereum]: Currency.Ether,
  [Chain.Polygon]: Currency.Matic,
  [Chain.Avalanche]: Currency.Avax,
  [Chain.Mumbai]: Currency.Matic,
};

export const CHAIN_TO_RPC: Record<Chain, string> = {
  [Chain.Ethereum]: "https://rpc.ankr.com/eth",
  [Chain.Polygon]: "https://polygon-rpc.com",
  [Chain.Avalanche]: "https://api.avax.network/ext/bc/C/rpc",
  [Chain.Mumbai]: "https://rpc.ankr.com/polygon_mumbai",
};

export const SWAPTOR_ADDRESSES: Record<SwaptorChains, string> = {
  [Chain.Mumbai]: "0xF54C99Af22A99174BfC6383a0170EdcCF1A46fde",
};
