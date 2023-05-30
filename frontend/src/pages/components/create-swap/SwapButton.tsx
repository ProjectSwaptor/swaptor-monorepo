import { useEffect, useState } from "react";
import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import { nanoid } from "nanoid";

import { TokenData } from "@/types";
import { createSwap } from "@/api/swaptor-backend/swaps";
import {
  encodeSwapArguments,
  getCurrentChainId,
  getSigner,
  getSwapSignature,
} from "@/utils/blockchain";
import {
  SwapType,
  SWAP_TYPE_TO_TOKENS,
  TokenType,
  ONE_DAY_IN_SECONDS,
  SupportedChain,
  SWAP_ID_LENGTH,
  SwapStatus,
} from "@/constants";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getBlockchainTime } from "@/api/swaptor-backend/oracles";
import { displayFailureMessage } from "@/utils/toasts";
import {
  handleApprove,
  checkTokenApprovals,
  checkTokenAllowance,
} from "@/api/blockchain/common";

export type SwapArgs = {
  swapType: SwapType;
  buyer: string;
  offeredToken: TokenData;
  wantedToken: TokenData;
};

export type SwapButtonProps = SwapArgs & {
  resetForm(): void;
};

const ACTIVE_BUTTON_STYLE =
  "bg-teal-400 hover:bg-teal-500 transition text-black font-semibold rounded-lg py-2 mt-2";
const INACTIVE_BUTTON_STYLE =
  "bg-gray-700 transition text-gray-400 font-semibold rounded-lg py-2 mt-2 animate-pulse";

const SUCCESS_MESSAGE = "Approval successful! Create Swap to continue...";

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

const SwapButton = ({
  buyer,
  swapType,
  offeredToken,
  wantedToken,
  resetForm,
}: SwapButtonProps) => {
  let id: string = "0";

  const router = useRouter();

  const [swapStatus, setSwapStatus] = useState(SwapStatus.INIT);
  const [connectedAddress, setConnectedAddress] = useState("");
  const [{ wallet }] = useConnectWallet();

  const { address: offeredTokenAddress, tokenData: offeredTokenData } =
    offeredToken || { address: ethers.constants.AddressZero, tokenData: "0" };
  const { address: wantedTokenAddress, tokenData: wantedTokenData } =
    wantedToken || { address: ethers.constants.AddressZero, tokenData: "0" };

  const { offeredTokenType, wantedTokenType } = swapType
    ? SWAP_TYPE_TO_TOKENS[swapType]
    : { offeredTokenType: TokenType.ERC20, wantedTokenType: TokenType.ERC20 };

  useEffect(() => {
    if (wallet) {
      setConnectedAddress(wallet.accounts[0].address);
    }
  }, [wallet]);

  useEffect(() => {
    const checkAllowance = async () => {
      if (connectedAddress) {
        await checkTokenAllowance(
          offeredTokenType,
          offeredTokenAddress,
          parseTokenData(offeredTokenType, offeredTokenData),
          connectedAddress,
          getSigner(wallet!),
          swapStatus,
          setSwapStatus
        );
      }
    };

    checkAllowance();
  }, [
    connectedAddress,
    offeredTokenAddress,
    offeredTokenType,
    offeredTokenData,
  ]);

  const handleApproveForCreateSwap = async () => {
    await handleApprove(
      setSwapStatus,
      offeredTokenType,
      offeredTokenAddress,
      connectedAddress!,
      wallet!,
      parseTokenData(offeredTokenType, offeredTokenData),
      SUCCESS_MESSAGE
    );
  };

  const handleSign = async () => {
    id = nanoid(SWAP_ID_LENGTH);

    setSwapStatus(SwapStatus.FINALIZATION_PENDING);

    const chain = getCurrentChainId(wallet!);
    const expirationTime = (await getExpirationTime(chain))!.toString();
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

    let { res, err } = await getSwapSignature(signer, encodedArgs);

    if (err) {
      const errorMessage = err.message.includes("user rejected signing")
        ? "Signature rejected."
        : "Signature failed, please try again.";

      displayFailureMessage(errorMessage);
      setSwapStatus(SwapStatus.APPROVED);

      return;
    }

    const signature = res!;

    ({ err } = await createSwap({
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
    }));

    if (!err) {
      setSwapStatus(SwapStatus.FINALIZED);

      await router.push(`/swap-overview/${id}`);
      resetForm();
    } else {
      setSwapStatus(SwapStatus.APPROVED);
      displayFailureMessage("Swap creation failed, please try again.");
    }
  };

  const handleSwapButtonClick = async () => {
    switch (swapStatus) {
      case SwapStatus.INIT:
        return await handleApproveForCreateSwap();
      case SwapStatus.APPROVED:
        return await handleSign();
      case SwapStatus.FINALIZED:
      case SwapStatus.APPROVAL_PENDING:
      case SwapStatus.FINALIZATION_PENDING:
        return;
    }

    const _ensureAllCasesCovered: never = swapStatus;
  };

  const getSwapButtonText = () => {
    switch (swapStatus) {
      case SwapStatus.INIT:
        return "Approve";
      case SwapStatus.APPROVAL_PENDING:
        return "Approval Pending...";
      case SwapStatus.APPROVED:
        return "Create Swap";
      case SwapStatus.FINALIZATION_PENDING:
        return "Signature Pending...";
      case SwapStatus.FINALIZED:
        return "Done";
    }

    const _ensureAllCasesCovered: never = swapStatus;
  };

  const getSwapButtonStyle = () => {
    switch (swapStatus) {
      case SwapStatus.INIT:
      case SwapStatus.APPROVED:
        return ACTIVE_BUTTON_STYLE;
      case SwapStatus.APPROVAL_PENDING:
      case SwapStatus.FINALIZATION_PENDING:
      case SwapStatus.FINALIZED:
        return INACTIVE_BUTTON_STYLE;
    }

    const _ensureAllCasesCovered: never = swapStatus;
  };

  const getSwapButtonDisabled = () => {
    switch (swapStatus) {
      case SwapStatus.INIT:
      case SwapStatus.APPROVED:
        return false;
      case SwapStatus.APPROVAL_PENDING:
      case SwapStatus.FINALIZATION_PENDING:
      case SwapStatus.FINALIZED:
        return true;
    }

    const _ensureAllCasesCovered: never = swapStatus;
  };

  return (
    <div>
      <button
        className={`${getSwapButtonStyle()} flex justify-center w-full text-lg`}
        onClick={handleSwapButtonClick}
        disabled={getSwapButtonDisabled()}
      >
        {getSwapButtonText()}
      </button>
      <ToastContainer />
    </div>
  );
};

export default SwapButton;
