import { ethers } from "ethers";

import { TokenType, TOKEN_TYPE_TO_ABI } from "@/constants";
import { WalletState } from "@web3-onboard/core";
import { executeAsync } from "../wrappers";
import { SWAPTOR_ADDRESS } from "@/environment";

export const approve = async (
  wallet: WalletState,
  tokenType: TokenType,
  tokenAddress: string,
  tokenData: string
) => {
  const provider = new ethers.providers.Web3Provider(wallet.provider, "any");
  const signer = provider.getSigner();

  const token = new ethers.Contract(
    tokenAddress,
    TOKEN_TYPE_TO_ABI[tokenType],
    signer
  );

  return await executeAsync(
    async () => await (await token.approve(SWAPTOR_ADDRESS, tokenData)).wait()
  );
};
