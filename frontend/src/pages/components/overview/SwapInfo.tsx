import { SwapType } from "@/constants";
import { GetSwapDto } from "@/constants/blockchain/types";
import { getTokenTypes } from "@/utils/token";
import { ethers } from "ethers";
import TokenInfoCard from "./TokenInfoCard";
import TokenLogo from "./TokenLogo";

const SwapInfo = ({ swap }: { swap: GetSwapDto }) => {
  const {
    seller,
    buyer,
    offeredTokenAddress,
    offeredTokenData,
    wantedTokenAddress,
    wantedTokenData,
    swapType,
  } = swap || {
    seller: ethers.constants.AddressZero,
    buyer: ethers.constants.AddressZero,
    offeredTokenAddress: ethers.constants.AddressZero,
    offeredTokenData: "0",
    wantedTokenAddress: ethers.constants.AddressZero,
    wantedTokenData: "0",
    swapType: SwapType.ERC20_FOR_ERC20,
  };

  const { offeredTokenType, wantedTokenType } = getTokenTypes(swapType);

  return (
    <div className="flex flex-col md:flex-row w-full rounded-lg h-full items-center justify-around">
      <div className="relative flex flex-col w-[20rem] bg-[#1F2937] rounded-lg break-all">
        <TokenLogo tokenAddress={offeredTokenAddress} />
        <TokenInfoCard
          tokenAddress={offeredTokenAddress}
          tokenData={offeredTokenData}
          tokenType={offeredTokenType}
          owner={seller}
        />
      </div>
      <div className="flex flex-row rotate-90 mt-[2rem] mb-[4rem] md:m-0 md:rotate-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 opacity-30"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 opacity-30"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </div>
      <div className="relative flex flex-col w-[20rem] bg-[#1F2937] rounded-lg break-all">
        <TokenLogo tokenAddress={wantedTokenAddress} />
        <TokenInfoCard
          tokenAddress={wantedTokenAddress}
          tokenData={wantedTokenData}
          tokenType={wantedTokenType}
          owner={buyer}
        />
      </div>
    </div>
  );
};

export default SwapInfo;
