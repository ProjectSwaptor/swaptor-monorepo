import ERC20Artifact from "../abis/ERC20.json";
import ERC721Artifact from "../abis/ERC721.json";

import { CreateSwapEncodeArgs, SwapTokens } from "@/types";

export const ONE_DAY_IN_SECONDS = 86400;
export const REFRESH_FEE_TIME_IN_MS = 5000;

export const SWAP_ID_LENGTH = 36;

export enum TokenType {
  ERC721 = "ERC721",
  ERC20 = "ERC20",
}

export enum SwapType {
  ERC20_FOR_ERC20,
  ERC20_FOR_ERC721,
  ERC721_FOR_ERC20,
  ERC721_FOR_ERC721,
}

export enum SupportedChain {
  Mumbai = "0x13881",
}

export const CHAIN_TO_RPC: Record<SupportedChain, string> = {
  [SupportedChain.Mumbai]: "https://rpc.ankr.com/polygon_mumbai",
};

export const CHAIN_TO_SYMBOL: Record<SupportedChain, string> = {
  [SupportedChain.Mumbai]: "MATIC",
};

export const TOKEN_TYPE_TO_ABI: Record<TokenType, any> = {
  [TokenType.ERC20]: ERC20Artifact.abi,
  [TokenType.ERC721]: ERC721Artifact.abi,
};

export const CreateSwapArgsTypes: Record<keyof CreateSwapEncodeArgs, string> = {
  id: "string",
  swapType: "uint8",
  seller: "address",
  buyer: "address",
  offeredTokenAddress: "address",
  offeredTokenData: "uint256",
  wantedTokenAddress: "address",
  wantedTokenData: "uint256",
  chainId: "uint256",
  expirationTime: "uint256",
};

export const TOKENS_TO_SWAP_TYPE: Record<
  TokenType,
  Record<TokenType, SwapType>
> = {
  ERC20: {
    ERC20: SwapType.ERC20_FOR_ERC20,
    ERC721: SwapType.ERC20_FOR_ERC721,
  },
  ERC721: {
    ERC20: SwapType.ERC721_FOR_ERC20,
    ERC721: SwapType.ERC721_FOR_ERC721,
  },
};

export const SWAP_TYPE_TO_TOKENS: Record<SwapType, SwapTokens> = {
  [SwapType.ERC20_FOR_ERC20]: {
    offeredTokenType: TokenType.ERC20,
    wantedTokenType: TokenType.ERC20,
  },
  [SwapType.ERC20_FOR_ERC721]: {
    offeredTokenType: TokenType.ERC20,
    wantedTokenType: TokenType.ERC721,
  },
  [SwapType.ERC721_FOR_ERC20]: {
    offeredTokenType: TokenType.ERC721,
    wantedTokenType: TokenType.ERC20,
  },
  [SwapType.ERC721_FOR_ERC721]: {
    offeredTokenType: TokenType.ERC721,
    wantedTokenType: TokenType.ERC721,
  },
};
