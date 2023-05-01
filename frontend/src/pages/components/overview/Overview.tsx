import { useRecoilState } from "recoil";

import { GetSwapDto } from "@/constants/blockchain/types";
import OverviewButtons from "./OverviewButtons";
import Status from "./Status";
import SwapInfo from "./SwapInfo";
import LoadingSpinnerIcon from "../icons/LoadingSpinnerIcon";
import { swapActive } from "@/state/atoms";

type OverviewProps = {
  swap: GetSwapDto;
};

const Overview = ({ swap }: OverviewProps) => {
  const [active] = useRecoilState(swapActive);

  return (
    <div className="flex w-full h-full justify-center items-start mt-20 md:mt-10">
      <div className="flex flex-col md:items-start md:rounded-3xl md:p-20 lg:border-gray-700 lg:border-[1px]">
        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-col mb-[4rem] md:mb-[2.5rem] 2xl:px-8">
            <h1 className="text-[1.3rem] font-bold leading-none mb-6 lg:text-[1.8rem]">
              Swap Overview
            </h1>
          </div>
          <div>{active !== undefined && <Status active={active} />}</div>
        </div>

        <span className="flex mx-auto mb-4 md:mb-8">
          <SwapInfo swap={swap} />
        </span>
        <OverviewButtons swap={swap} />
      </div>
    </div>
  );
};

export default Overview;
