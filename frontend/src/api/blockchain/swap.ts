import { SWAPTOR_CONTRACT } from "@/constants/blockchain/contracts";
import { GetSwapDto, SwapType } from "@/constants/blockchain/types";
import { encodeSwapArguments } from "@/utils/blockchain";
import { BigNumberish, ContractReceipt, Signer } from "ethers";
import { executeAsync } from "../wrappers";

const swapTypeToSwapFunction = (signer: Signer, swapType: SwapType) => {
  const swaptorContract = SWAPTOR_CONTRACT.connect(signer);

  switch (swapType) {
    case SwapType.ERC20_FOR_ERC20:
      return swaptorContract.swapERC20ForERC20;
    case SwapType.ERC20_FOR_ERC721:
      return swaptorContract.swapERC20ForERC721;
    case SwapType.ERC721_FOR_ERC20:
      return swaptorContract.swapERC721ForERC20;
    case SwapType.ERC721_FOR_ERC721:
      return swaptorContract.swapERC721ForERC721;
  }

  const _ensureAllCasesCovered: never = swapType;
};

export const getFreeTrialEndTime = async (signer: Signer) => {
  const swaptorContract = SWAPTOR_CONTRACT.connect(signer);

  return (await swaptorContract.freeTrialEndTime()).toString();
};

export const acceptSwap = async (
  signer: Signer,
  swap: GetSwapDto,
  feeInWei: BigNumberish
) => {
  const {
    id,
    swapType,
    seller,
    buyer,
    offeredTokenAddress,
    offeredTokenData,
    wantedTokenAddress,
    wantedTokenData,
    chainId,
    expirationTime,
    signature,
  } = swap;

  const swapArguments = encodeSwapArguments({
    id,
    swapType,
    seller,
    buyer,
    offeredTokenAddress,
    offeredTokenData,
    wantedTokenAddress,
    wantedTokenData,
    chainId,
    expirationTime,
  });

  return await executeAsync<ContractReceipt>(
    async () =>
      await (
        await swapTypeToSwapFunction(signer, swapType)(
          swapArguments,
          signature,
          {
            value: feeInWei,
          }
        )
      ).wait()
  );
};
