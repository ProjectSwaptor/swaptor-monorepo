import { SwapType, TokenType } from "@/constants";

export type TokenInfo = {
  symbol: string;
  name: string;
  address: string;
  tokenType: TokenType;
  logoFileName?: string;
};

export type TokenSelection = {
  symbol?: string;
  name?: string;
  address?: string;
  tokenType?: TokenType;
  logoFileName?: string;
  tokenData?: string;
};

export type CreateSwapArgs = {
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
};

export type UpdateSwapState = {
  id: string;
  active: boolean;
};

export type SwapTokens = {
  offeredTokenType: TokenType;
  wantedTokenType: TokenType;
};

export type CreateSwapEncodeArgs = Omit<CreateSwapArgs, "signature">;

export type TokenData = Required<Pick<TokenSelection, "address" | "tokenData">>;
