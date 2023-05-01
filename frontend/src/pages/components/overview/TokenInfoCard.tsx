import { ethers } from "ethers";

import { TokenType } from "@/constants/blockchain/types";

const labelStyle = "text-[0.7rem] text-gray-200 font-light mb-[0.1rem]";
const valueStyle = "text-[0.9rem]";

const TokenInfoCard = ({
  tokenAddress,
  tokenData,
  tokenType,
  owner,
}: {
  tokenAddress: string;
  tokenData: string;
  tokenType: TokenType;
  owner: string;
}) => {
  return (
    <div className="flex flex-col px-8 pt-8 h-[20rem] gap-y-[0.6rem]">
      <div>
        <h3 className={labelStyle}>Token Address:</h3>
        <p className={`${valueStyle} font-robotomono`}>{tokenAddress}</p>
      </div>
      <div>
        <h3 className={labelStyle}>
          {tokenType === TokenType.ERC20 ? "Amount:" : "Id:"}
        </h3>
        <p className={`${valueStyle} font-robotomono`}>
          {tokenType === TokenType.ERC20
            ? ethers.utils.formatEther(tokenData)
            : `#${tokenData}`}
        </p>
      </div>
      <div>
        <h3 className={labelStyle}>Type:</h3>
        <p className={valueStyle}>
          {tokenType === TokenType.ERC20 ? "ERC20" : "ERC721"}
        </p>
      </div>

      <hr className="bg-[#111827] border-none h-[1px] my-2 w-[calc(100%_+_4rem)] -mx-[2rem]" />

      <div>
        <h3 className={labelStyle}>Token Sender:</h3>
        {owner !== ethers.constants.AddressZero ? (
          <p className={`${valueStyle} font-robotomono`}>{owner}</p>
        ) : (
          <p className={valueStyle}>Anyone</p>
        )}
      </div>
    </div>
  );
};

export default TokenInfoCard;
