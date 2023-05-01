import React from "react";

import LoadingSpinnerIcon from "../../icons/LoadingSpinnerIcon";
import PromoTimer from "./PromoTimer";

type PromoDisplayProps = {
  promoDuration?: number;
};

const PromoDisplay = ({ promoDuration }: PromoDisplayProps) => {
  if (promoDuration === undefined)
    return (
      <div className="h-[2rem] w-[2rem] text-gray-600 fill-teal-400">
        <LoadingSpinnerIcon />
      </div>
    );

  if (promoDuration <= 0) {
    return (
      <div className="flex flex-col items-center text-lg">
        <p className="font-bold text-xl text-emerald-300">
          Swaptor is currently in the testing phase!
        </p>
        <p className="text-sm text-emerald-300">
          Thank you for participating.
        </p>
      </div>
    );
  }

  return (
    <div className="countdown-timer flex flex-col items-center">
      <h3 className="leading-6 text-[1rem] sm:text-[1.2rem]">
        FREE SWAP PERIOD REMAINING
      </h3>

      <PromoTimer promoDuration={promoDuration} />
    </div>
  );
};

export default PromoDisplay;
