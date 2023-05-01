import { TokenInfo } from "@/types";
import RandomAvatar from "../icons/RandomAvatar";

const TokenOption = ({
  name,
  symbol,
  address,
}: Pick<TokenInfo, "name" | "symbol" | "address">) => (
  <div
    className="w-[calc(100%_+_2rem)] -mx-4 flex px-4 py-2 transition 
              hover:bg-gray-700 cursor-pointer items-center"
  >
    <div className="mr-4 w-8 h-8 relative">
      <RandomAvatar seed={address} />
    </div>

    <div className="flex flex-col">
      <p>{name}</p>
      <p className="text-sm font-light text-gray-400 text-left">{symbol}</p>
    </div>
  </div>
);

export default TokenOption;
