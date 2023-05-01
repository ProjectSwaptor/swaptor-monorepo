import { useState } from "react";
import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import { nanoid } from "nanoid";

import { TokenData } from "@/types";
import { createSwap } from "@/api/swaptor-backend/swaps";
import { encodeSwapArguments, getSwapSignature } from "@/utils/blockchain";
import {
  SwapType,
  SWAP_TYPE_TO_TOKENS,
  TokenType,
  ONE_DAY_IN_SECONDS,
  SupportedChain,
  SWAP_ID_LENGTH,
} from "@/constants";
import { approve } from "@/api/token-contract";
import LoadingSpinnerIcon from "../icons/LoadingSpinnerIcon";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getBlockchainTime } from "@/api/swaptor-backend/oracles";

enum SwapStatus {
  INIT,
  APPROVED,
  SIGNED,
}

export type SwapArgs = {
  swapType: SwapType;
  buyer: string;
  offeredToken: TokenData;
  wantedToken: TokenData;
};

export type SwapButtonProps = SwapArgs & {
  resetForm(): void;
};

const SwapButton = ({
  buyer,
  swapType,
  offeredToken,
  wantedToken,
  resetForm,
}: SwapButtonProps) => {
  let id: string = "0";

  const router = useRouter();

  const [waitingForTx, setWaitingForTx] = useState(false);
  const [swapStatus, setSwapStatus] = useState(SwapStatus.INIT);
  const [{ wallet }] = useConnectWallet();

  const { address: offeredTokenAddress, tokenData: offeredTokenData } =
    offeredToken || { address: ethers.constants.AddressZero, tokenData: "0" };
  const { address: wantedTokenAddress, tokenData: wantedTokenData } =
    wantedToken || { address: ethers.constants.AddressZero, tokenData: "0" };

  const { offeredTokenType, wantedTokenType } = swapType
    ? SWAP_TYPE_TO_TOKENS[swapType]
    : { offeredTokenType: TokenType.ERC20, wantedTokenType: TokenType.ERC20 };

  const getExpirationTime = async (chainId: SupportedChain) => {
    const { err, res } = await getBlockchainTime(chainId);

    if (err) {
      return;
    }

    return +res!.data.chainTime + ONE_DAY_IN_SECONDS;
  };

  const parseTokenData = (tokenType: TokenType, tokenData: string) => {
    if (tokenType === TokenType.ERC20) {
      return ethers.utils.parseEther(tokenData).toString();
    }
    return tokenData;
  };

  const displaySuccessMessage = () =>
    toast.success("Success!", { autoClose: 3000, position: "top-center" });
  const displayFailureMessage = () =>
    toast.error("Something went wrong.", {
      autoClose: 3000,
      position: "top-center",
    });

  const handleApprove = async () => {
    setWaitingForTx(true);

    const { err } = await approve(
      wallet!,
      offeredTokenType,
      offeredTokenAddress,
      parseTokenData(offeredTokenType, offeredTokenData)
    );

    setWaitingForTx(false);

    if (!err) {
      setSwapStatus(SwapStatus.APPROVED);

      displaySuccessMessage();
    } else {
      displayFailureMessage();
    }
  };

  const handleSign = async () => {
    id = nanoid(SWAP_ID_LENGTH);

    setWaitingForTx(true);

    const expirationTime = (await getExpirationTime(
      wallet!.chains[0].id as SupportedChain
    ))!.toString();
    const chainId = parseInt(wallet!.chains[0].id, 16).toString();
    const provider = wallet!.provider;

    const web3Provider = new ethers.providers.Web3Provider(provider, "any");
    const signer = web3Provider.getSigner();
    const seller = await signer.getAddress();

    const offeredTokenDataParsed = parseTokenData(
      offeredTokenType,
      offeredTokenData
    );
    const wantedTokenDataParsed = parseTokenData(
      wantedTokenType,
      wantedTokenData
    );

    const encodedArgs = encodeSwapArguments({
      id,
      swapType,
      seller,
      buyer,
      offeredTokenAddress,
      offeredTokenData: offeredTokenDataParsed,
      wantedTokenAddress,
      wantedTokenData: wantedTokenDataParsed,
      chainId,
      expirationTime,
    });

    const signature = await getSwapSignature(signer, encodedArgs);

    const { err } = await createSwap({
      id,
      signature,
      swapType,
      seller,
      buyer,
      offeredTokenAddress,
      offeredTokenData: offeredTokenDataParsed,
      wantedTokenAddress,
      wantedTokenData: wantedTokenDataParsed,
      chainId,
      expirationTime,
    });

    setWaitingForTx(false);

    if (!err) {
      setSwapStatus(SwapStatus.SIGNED);
    } else {
      displayFailureMessage();
    }
  };

  const handleSwapCreation = async () => {
    switch (swapStatus) {
      case SwapStatus.INIT:
        return await handleApprove();
      case SwapStatus.APPROVED:
        await handleSign();
        await router.push(`/swap-overview/${id}`);
      case SwapStatus.SIGNED:
        resetForm();
        // Do an action that will reset the swap state
        return;
    }

    const _ensureAllCasesCovered: never = swapStatus;
  };

  const handleSwapButtonText = () => {
    switch (swapStatus) {
      case SwapStatus.INIT:
        return "Approve";
      case SwapStatus.APPROVED:
        return "Sign";
      case SwapStatus.SIGNED:
        return "Done";
    }

    const _ensureAllCasesCovered: never = swapStatus;
  };

  return (
    <div>
      <button
        className="w-full bg-teal-400 hover:bg-teal-500 transition text-black font-semibold rounded-lg py-2 mt-2 text-lg"
        onClick={handleSwapCreation}
      >
        {waitingForTx ? (
          <div className="w-full h-full flex justify-center">
            <div className="w-8 h-8 text-gray-600 fill-gray-400">
              <LoadingSpinnerIcon />
            </div>
          </div>
        ) : (
          handleSwapButtonText()
        )}
      </button>
      <ToastContainer />
    </div>
  );
};

export default SwapButton;
