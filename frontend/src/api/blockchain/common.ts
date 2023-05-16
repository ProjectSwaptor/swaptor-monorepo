import { BigNumber, ethers, Signer } from "ethers";

import { CHAIN_TO_RPC, SupportedChain } from "@/constants";
import { executeAsync } from "../wrappers";
import { SWAPTOR_ADDRESS } from "@/environment";
import { getERC20Contract, getERC721Contract } from "@/utils/blockchain";

export const getChainTime = async (chain: SupportedChain) => {
  const rpc = CHAIN_TO_RPC[chain];
  const provider = new ethers.providers.JsonRpcProvider(rpc);

  return await executeAsync(async () => {
    const blockNumber = await provider.getBlockNumber();
    const { timestamp } = await provider.getBlock(blockNumber);

    return timestamp;
  });
};

export const checkERC20Allowance = async (
  tokenAddress: string,
  tokenData: string,
  connectedAddress: string,
  signer: Signer
): Promise<boolean> => {
  try {
    console.log(tokenAddress, connectedAddress, SWAPTOR_ADDRESS);
    const allowance = (
      await getERC20Contract(tokenAddress)
        .connect(signer)
        .allowance(connectedAddress, SWAPTOR_ADDRESS)
    ).toString();

    console.log(allowance, tokenData);

    return BigNumber.from(allowance).gte(BigNumber.from(tokenData));
  } catch (e: any) {
    console.log(e.message);
    return false;
  }
};

export const checkERC721Approval = async (
  tokenAddress: string,
  tokenData: string,
  connectedAddress: string,
  signer: Signer
): Promise<boolean> => {
  try {
    const token = getERC721Contract(tokenAddress).connect(signer);
    const ownerOf = await token.ownerOf(tokenData);
    const approved = await token.getApproved(tokenData);

    return (
      ownerOf.toLowerCase() === connectedAddress &&
      approved.toLowerCase() === SWAPTOR_ADDRESS!.toLowerCase()
    );
  } catch (e: any) {
    console.log(e.message);
    return false;
  }
};
