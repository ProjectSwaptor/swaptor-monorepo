import { ChainId } from "@web3-onboard/common/dist";

import { mumbai } from "./allowed-chains";
import { TokenInfo } from "@/types";
import { TokenType } from "@/constants";

export const tokenOptions: Record<ChainId, TokenInfo[]> = {
  [mumbai.id]: [
    {
      symbol: "TestERC20",
      name: "Test ERC20",
      tokenType: TokenType.ERC20,
      address: "0x849C687c375e0f6D4D61aA378D0fb057601639E1",
    },
    {
      symbol: "TestERC721",
      name: "Test ERC721",
      tokenType: TokenType.ERC721,
      address: "0x7BB1e1Af4B28C2Aeba4d583a6862C75A986a312b",
    },
  ],
};
