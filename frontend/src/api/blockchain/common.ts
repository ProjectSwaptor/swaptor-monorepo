import { BigNumber, ethers, Signer } from "ethers";

import {
  CHAIN_TO_RPC,
  SupportedChain,
  SwapStatus,
  TokenType,
} from "@/constants";
import { executeAsync } from "../wrappers";
import { getERC20Contract, getSigner } from "@/utils/blockchain";
import { SWAPTOR_ADDRESS } from "@/environment";
import { WalletState } from "@web3-onboard/core";
import { approve } from "../token-contract";
import {
  displayFailureMessage,
  displaySuccessMessage,
  displayWarningMessage,
} from "@/utils/toasts";

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

export const handleApprove = async (
  setSwapStatus: (swapStatus: SwapStatus) => void,
  tokenType: TokenType,
  tokenAddress: string,
  connectedAddress: string,
  wallet: WalletState,
  parsedTokenData: string,
  successMsg: string
) => {
  setSwapStatus(SwapStatus.APPROVAL_PENDING);

  const { err } = await approve(
    wallet,
    tokenType,
    tokenAddress,
    parsedTokenData
  );

  if (err) {
    setSwapStatus(SwapStatus.INIT);

    const errorMessage = err.message.includes("user rejected transaction")
      ? "Approval rejected."
      : "Approval failed, please try again.";

    displayFailureMessage(errorMessage);
  } else {
    if (tokenType === TokenType.ERC20) {
      const enoughAllowance = await checkERC20Allowance(
        tokenAddress,
        parsedTokenData,
        connectedAddress,
        getSigner(wallet)
      );

      if (!enoughAllowance) {
        setSwapStatus(SwapStatus.INIT);

        displayWarningMessage("Oops! You haven't approved enough tokens.");

        return;
      }
    }

    setSwapStatus(SwapStatus.APPROVED);
    displaySuccessMessage(successMsg);
  }
};
