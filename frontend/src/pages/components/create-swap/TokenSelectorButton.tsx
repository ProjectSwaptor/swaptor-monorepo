import { TokenSelection } from "@/types";
import DownArrow from "../icons/DownArrow";
import RandomAvatar from "../icons/RandomAvatar";

type TokenSelectorButtonProps = {
  tokenSelection: TokenSelection;
};

const TokenSelectorButton = ({ tokenSelection }: TokenSelectorButtonProps) => {
  const commonStyle =
    "flex items-center font-semibold cursor-pointer tracking-wider px-3 py-1 transition duration-150 w-full rounded-full";

  if (
    !tokenSelection ||
    tokenSelection.symbol === undefined ||
    tokenSelection.address === undefined
  ) {
    return (
      <div
        className={`${commonStyle} bg-teal-700 text-teal-100 hover:bg-teal-800`}
      >
        <p className="mr-2">Select Token</p>
        <div className="flex items-center ml-auto">
          <DownArrow />
        </div>
      </div>
    );
  }

  return (
    <div className={"rounded-full overflow-hidden"}>
      <div
        className={`${commonStyle} bg-gray-600 text-gray-100 hover:bg-gray-700`}
      >
        <div className="h-5 w-5 mr-3 relative">
          <RandomAvatar seed={tokenSelection.address} />
        </div>
        <p className="mr-1">{tokenSelection.symbol}</p>
        <div className="flex items-center ml-auto">
          <DownArrow />
        </div>
      </div>
    </div>
  );
};

export default TokenSelectorButton;
