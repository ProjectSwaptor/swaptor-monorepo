export enum SwapType {
  ERC20_FOR_ERC20,
  ERC20_FOR_ERC721,
  ERC721_FOR_ERC20,
  ERC721_FOR_ERC721,
}

export interface GetSwapDto {
  id: string;
  active: boolean;
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

export enum TokenType {
  ERC20,
  ERC721,
  ERC1155,
}
