import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import { BigNumber, ethers } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import LoadingSpinnerIcon from "../icons/LoadingSpinnerIcon";
import ShareSwapModal from "./ShareSwapModal";
import { GetSwapDto } from "@/constants/blockchain/types";
import { acceptSwap, getFreeTrialEndTime } from "@/api/blockchain/swap";
import { FRONTEND_URL } from "@/environment";
import { SupportedChain, SWAP_TYPE_TO_TOKENS, TokenType } from "@/constants";
import { getFeeInWei, getSigner } from "@/utils/blockchain";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { approve } from "@/api/token-contract";
import { parseTokenData } from "@/utils/token";
import { getNativeCurrencyPrice } from "@/api/swaptor-backend/oracles";
import {
  getBlockchainTime,
  updateSwapState,
} from "@/api/swaptor-backend/swaps";
import { useRecoilState } from "recoil";
import { swapActive } from "@/state/atoms";

enum SwapStatus {
  INIT,
  APPROVED,
}

const OverviewButtons = ({ swap }: { swap: GetSwapDto }) => {
  const [connectedAddress, setConnectedAddress] = useState("");
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [swapStatus, setSwapStatus] = useState(SwapStatus.INIT);
  const [waitingForTx, setWaitingForTx] = useState(false);
  const [active, setActive] = useRecoilState(swapActive);

  const [{ connectedChain }] = useSetChain();
  const [{ wallet }, connect] = useConnectWallet();

  const router = useRouter();

  const {
    query: { swapId },
  } = router;

  useEffect(() => {
    if (wallet) {
      setConnectedAddress(wallet.accounts[0].address);
    }
  }, [wallet]);

  const { seller, buyer, swapType, wantedTokenAddress, wantedTokenData } =
    swap || {
      seller: ethers.constants.AddressZero,
      buyer: ethers.constants.AddressZero,
      swapType: 0,
      wantedTokenAddress: ethers.constants.AddressZero,
      wantedTokenData: "0",
    };

  const { wantedTokenType } = swapType
    ? SWAP_TYPE_TO_TOKENS[swapType]
    : { wantedTokenType: TokenType.ERC20 };

  const displaySuccessMessage = () =>
    toast.success("Success!", { autoClose: 3000, position: "top-center" });
  const displayFailureMessage = () =>
    toast.error("Something went wrong.", {
      autoClose: 3000,
      position: "top-center",
    });

  const handleShareClick = () => {
    setShareModalVisible(true);
  };

  const handleApprove = async () => {
    setWaitingForTx(true);

    const { err } = await approve(
      wallet!,
      wantedTokenType,
      wantedTokenAddress,
      parseTokenData(wantedTokenType, wantedTokenData)
    );

    setWaitingForTx(false);

    if (!err) {
      setSwapStatus(SwapStatus.APPROVED);

      displaySuccessMessage();
    } else {
      displayFailureMessage();
    }
  };

  const handleAccept = async () => {
    const signer = getSigner(wallet!);

    setWaitingForTx(true);

    const { err, res } = await getNativeCurrencyPrice(
      connectedChain!.id as SupportedChain
    );

    if (err) {
      return err;
    }

    const freeTrialEndTime = await getFreeTrialEndTime(signer);
    const { err: blockchainTimeError, res: blockchainTimeResponse } =
      await getBlockchainTime(connectedChain!.id as SupportedChain);

    const displayFailureMessage = (error: string) =>
      toast.error("Something went wrong: " + error, {
        autoClose: 3000,
        position: "top-center",
      });

    if (blockchainTimeError) {
      displayFailureMessage(blockchainTimeError.message);
      return;
    }
    const blockchainTime = blockchainTimeResponse!.data.time;

    const feeInWei =
      +freeTrialEndTime < +blockchainTime
        ? getFeeInWei(res!.data.price)
        : BigNumber.from(0);

    const { res: swapReceipt, err: swapErr } = await acceptSwap(
      signer,
      swap,
      feeInWei
    );

    setWaitingForTx(false);

    if (swapErr) {
      toast.error("Something went wrong: " + swapErr, {
        autoClose: 3000,
        position: "top-center",
      });
      return;
    } else {
      toast.success("Success!", { autoClose: 3000, position: "top-center" });
    }

    await updateSwapState(swap.id, swapReceipt!.transactionHash);

    setActive(false);
  };

  const handleAcceptSwap = async () => {
    switch (swapStatus) {
      case SwapStatus.INIT:
        return await handleApprove();
      case SwapStatus.APPROVED:
        return await handleAccept();
    }

    const _ensureAllCasesCovered: never = swapStatus;
  };

  const handleSwapButtonText = () => {
    switch (swapStatus) {
      case SwapStatus.INIT:
        return "Approve";
      case SwapStatus.APPROVED:
        return "Accept Swap";
    }

    const _ensureAllCasesCovered: never = swapStatus;
  };

  return (
    <div className="flex flex-col w-full justify-start items-center relative 2xl:top-5">
      <ShareSwapModal
        visible={shareModalVisible}
        setVisible={setShareModalVisible}
        swapLink={`${FRONTEND_URL}/swap-overview/${swapId}`}
      />
      {!active ? (
        <button
          className="btn-secondary btn-share h-10 w-[21.5rem] mt-5 md:mt-0 md:w-[44rem] lg:w-[51rem]"
          onClick={handleShareClick}
        >
          Share
        </button>
      ) : !wallet ? (
        <div className="flex flex-col items-center gap-4 lg:gap-5">
          <button
            className="btn-secondary btn-share h-10 w-[21.5rem] mt-5 md:mt-0 md:w-[44rem] lg:w-[51rem]"
            onClick={handleShareClick}
          >
            Share
          </button>
          <button
            className="btn-quaternary h-10 w-[21.5rem] md:mt-0 md:w-[44rem] lg:w-[51rem]"
            onClick={() => connect()}
          >
            Connect Wallet
          </button>
        </div>
      ) : connectedAddress === seller.toLowerCase() ? (
        <button
          className="btn-secondary btn-share h-10 w-[21.5rem] mt-5 md:mt-0 md:w-[44rem] lg:w-[51rem]"
          onClick={handleShareClick}
        >
          Share
        </button>
      ) : buyer !== ethers.constants.AddressZero &&
        connectedAddress !== buyer.toLowerCase() ? (
        <button className="btn-inactive cursor-default w-[21.5rem] mt-5 md:mt-0 md:w-[44rem] lg:w-[51rem]">
          Not Allowed to Accept
        </button>
      ) : waitingForTx ? (
        <div className="btn-primary w-[21.5rem] mt-5 md:mt-0 md:w-[44rem] lg:w-[51rem] flex justify-center">
          <div className="w-8 h-8 text-gray-600 fill-gray-400">
            <LoadingSpinnerIcon />
          </div>
        </div>
      ) : (
        <button
          className="btn-primary w-[21.5rem] mt-5 md:mt-0 md:w-[44rem] lg:w-[51rem]"
          onClick={handleAcceptSwap}
        >
          {handleSwapButtonText()}
        </button>
      )}
      <ToastContainer />
    </div>
  );
};

export default OverviewButtons;
