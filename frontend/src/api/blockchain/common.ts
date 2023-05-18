import { BigNumber, ethers, Signer } from "ethers";

import { CHAIN_TO_RPC, SupportedChain, TokenType } from "@/constants";
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
  tokenAmount: string,
  connectedAddress: string,
  signer: Signer
): Promise<boolean | undefined> => {
  try {
    const allowance = (
      await getERC20Contract(tokenAddress)
        .connect(signer)
        .allowance(connectedAddress, SWAPTOR_ADDRESS)
    ).toString();

    return BigNumber.from(allowance).gte(BigNumber.from(tokenAmount));
  } catch (e) {
    console.log(e);

    return;
  }
};

export const checkERC721Approval = async (
  tokenAddress: string,
  tokenId: string,
  connectedAddress: string,
  signer: Signer
): Promise<boolean | undefined> => {
  try {
    const token = getERC721Contract(tokenAddress).connect(signer);
    const ownerOf = await token.ownerOf(tokenId);
    const approved = await token.getApproved(tokenId);

    return (
      ownerOf.toLowerCase() === connectedAddress.toLowerCase() &&
      approved.toLowerCase() === SWAPTOR_ADDRESS!.toLowerCase()
    );
  } catch (e) {
    console.log(e);

    return;
  }
};

export const checkTokenApprovals = async (
  tokenType: TokenType,
  tokenAddress: string,
  tokenData: string,
  connectedAddress: string,
  signer: Signer
) => {
  let alreadyApproved: boolean | undefined;

  if (tokenType === TokenType.ERC20) {
    alreadyApproved = await checkERC20Allowance(
      tokenAddress,
      tokenData,
      connectedAddress,
      signer
    );
  } else {
    alreadyApproved = await checkERC721Approval(
      tokenAddress,
      tokenData,
      connectedAddress,
      signer
    );
  }

  return alreadyApproved;
};
