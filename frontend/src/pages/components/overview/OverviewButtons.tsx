import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import { BigNumber, ethers } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import ShareSwapModal from "./ShareSwapModal";
import { GetSwapDto } from "@/constants/blockchain/types";
import { acceptSwap, getFreeTrialEndTime } from "@/api/blockchain/swap";
import { FRONTEND_URL } from "@/environment";
import {
  SupportedChain,
  SwapStatus,
  SWAP_TYPE_TO_TOKENS,
  TokenType,
} from "@/constants";
import { getFeeInWei, getSigner } from "@/utils/blockchain";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { parseTokenData } from "@/utils/token";
import { getNativeCurrencyPrice } from "@/api/swaptor-backend/oracles";
import {
  getBlockchainTime,
  updateSwapState,
} from "@/api/swaptor-backend/swaps";
import { useRecoilState } from "recoil";
import { swapActive } from "@/state/atoms";
import SwitchChain from "../SwitchChain";
import { displayFailureMessage, displaySuccessMessage } from "@/utils/toasts";
import { handleApprove } from "@/api/blockchain/common";

const ACTIVE_BUTTON_STYLE =
  "bg-teal-400 hover:bg-teal-500 border border-teal-400 hover:border-teal-500 transition text-black font-semibold rounded-lg py-2";
const INACTIVE_BUTTON_STYLE =
  "bg-gray-700 text-gray-400 border border-gray-700 transition font-semibold animate-pulse rounded-lg py-2";

const SUCCESS_MESSAGE = "Approval successful! Accept Swap to continue...";

const OverviewButtons = ({ swap }: { swap: GetSwapDto }) => {
  const [connectedAddress, setConnectedAddress] = useState("");
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [swapStatus, setSwapStatus] = useState(SwapStatus.INIT);
  const [active, setActive] = useRecoilState(swapActive);

  const [{ chains, connectedChain }] = useSetChain();
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

  const handleShareClick = () => {
    setShareModalVisible(true);
  };

  const handleApproveForAcceptSwap = async () => {
    await handleApprove(
      setSwapStatus,
      wantedTokenType,
      wantedTokenAddress,
      connectedAddress!,
      wallet!,
      parseTokenData(wantedTokenType, wantedTokenData),
      SUCCESS_MESSAGE
    );
  };

  const handleAccept = async () => {
    setSwapStatus(SwapStatus.FINALIZATION_PENDING);

    const signer = getSigner(wallet!);

    const { err, res } = await getNativeCurrencyPrice(
      connectedChain!.id as SupportedChain
    );

    if (err) {
      return err;
    }

    const freeTrialEndTime = await getFreeTrialEndTime(signer);
    const { err: blockchainTimeError, res: blockchainTimeResponse } =
      await getBlockchainTime(connectedChain!.id as SupportedChain);

    if (blockchainTimeError) {
      setSwapStatus(SwapStatus.APPROVED);
      displayFailureMessage(blockchainTimeError.message);

      return;
    }
    const blockchainTime = blockchainTimeResponse!.data.chainTime;

    const feeInWei =
      +freeTrialEndTime < +blockchainTime
        ? getFeeInWei(res!.data.price)
        : BigNumber.from(0);

    const { res: swapReceipt, err: swapErr } = await acceptSwap(
      signer,
      swap,
      feeInWei
    );

    if (swapErr) {
      setSwapStatus(SwapStatus.APPROVED);
      const errorMessage = swapErr.message.includes("user rejected transaction")
        ? "Accept Swap rejected."
        : "Accept Swap failed, please try again.";

      displayFailureMessage(errorMessage);

      return;
    } else {
      setSwapStatus(SwapStatus.FINALIZED);

      displaySuccessMessage("Swap accepted!");
    }

    await updateSwapState(swap.id, swapReceipt!.transactionHash);

    setActive(false);
  };

  const handleAcceptSwap = async () => {
    switch (swapStatus) {
      case SwapStatus.INIT:
        return await handleApproveForAcceptSwap();
      case SwapStatus.APPROVED:
        return await handleAccept();
      case SwapStatus.APPROVAL_PENDING:
      case SwapStatus.FINALIZATION_PENDING:
      case SwapStatus.FINALIZED:
        return;
    }

    const _ensureAllCasesCovered: never = swapStatus;
  };

  const handleSwapButtonText = () => {
    switch (swapStatus) {
      case SwapStatus.INIT:
        return "Approve";
      case SwapStatus.APPROVAL_PENDING:
        return "Approval Pending...";
      case SwapStatus.APPROVED:
        return "Accept Swap";
      case SwapStatus.FINALIZATION_PENDING:
        return "Accept Pending...";
      case SwapStatus.FINALIZED:
        return "Accepted";
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
    <div className="flex flex-col w-full justify-start items-center relative 2xl:top-5">
      <ShareSwapModal
        visible={shareModalVisible}
        setVisible={setShareModalVisible}
        swapLink={`${FRONTEND_URL}/swap-overview/${swapId}`}
      />
      {(() => {
        if (!active) {
          return (
            <button
              className="btn-secondary w-[21.5rem] mt-5 md:mt-0 md:w-[44rem] lg:w-[51rem] flex justify-center text-lg py-2"
              onClick={handleShareClick}
            >
              Share
            </button>
          );
        }

        if (!wallet) {
          return (
            <div className="flex flex-col items-center gap-4 lg:gap-5">
              <button
                className="btn-secondary w-[21.5rem] mt-5 md:mt-0 md:w-[44rem] lg:w-[51rem] flex justify-center text-lg py-2"
                onClick={handleShareClick}
              >
                Share
              </button>
              <button
                className="btn-quaternary w-[21.5rem] md:mt-0 md:w-[44rem] lg:w-[51rem] flex justify-center text-lg py-2"
                onClick={() => connect()}
              >
                Connect Wallet
              </button>
            </div>
          );
        }

        if (connectedAddress === seller.toLowerCase()) {
          return (
            <button
              className="btn-secondary w-[21.5rem] mt-5 md:mt-0 md:w-[44rem] lg:w-[51rem] flex justify-center text-lg py-2"
              onClick={handleShareClick}
            >
              Share
            </button>
          );
        }

        if (
          buyer !== ethers.constants.AddressZero &&
          connectedAddress !== buyer.toLowerCase()
        ) {
          return (
            <button className="btn-inactive cursor-default w-[21.5rem] mt-5 md:mt-0 md:w-[44rem] lg:w-[51rem] flex justify-center text-lg py-2">
              Not Allowed to Accept
            </button>
          );
        }

        if (connectedChain && connectedChain.id !== chains[0].id) {
          return (
            <SwitchChain
              text="Switch Chain"
              chainId={chains[0].id}
              chainNamespace={chains[0].namespace}
            />
          );
        }

        return (
          <button
            className={`${getSwapButtonStyle()} w-[21.5rem] mt-5 md:mt-0 md:w-[44rem] lg:w-[51rem] flex justify-center text-lg`}
            onClick={handleAcceptSwap}
            disabled={getSwapButtonDisabled()}
          >
            {handleSwapButtonText()}
          </button>
        );
      })()}
      <ToastContainer />
    </div>
  );
};

export default OverviewButtons;
