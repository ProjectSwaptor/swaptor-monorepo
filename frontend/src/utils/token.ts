import { SwapType, TokenType } from "@/constants/blockchain/types";
import { ethers } from "ethers";

type tokenTypes = {
  offeredTokenType: TokenType;
  wantedTokenType: TokenType;
};

export const getTokenTypes = (swapType: SwapType): tokenTypes => {
  if (swapType === SwapType.ERC20_FOR_ERC20) {
    return {
      offeredTokenType: TokenType.ERC20,
      wantedTokenType: TokenType.ERC20,
    };
  } else if (swapType === SwapType.ERC20_FOR_ERC721) {
    return {
      offeredTokenType: TokenType.ERC20,
      wantedTokenType: TokenType.ERC721,
    };
  } else if (swapType === SwapType.ERC721_FOR_ERC20) {
    return {
      offeredTokenType: TokenType.ERC721,
      wantedTokenType: TokenType.ERC20,
    };
  } else {
    return {
      offeredTokenType: TokenType.ERC721,
      wantedTokenType: TokenType.ERC721,
    };
  }
};



export const parseTokenData = (tokenType: TokenType, tokenData: string) => {
  if (tokenType === TokenType.ERC20) {
    return ethers.utils.parseEther(tokenData).toString();
  }
  return tokenData;
};
