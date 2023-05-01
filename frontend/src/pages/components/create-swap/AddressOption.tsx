import { ethers } from "ethers";
import TogglerIcon from "../icons/TogglerIcon";
import InputContainer from "./InputContainer";
import { useState } from "react";

type AddressOptionProps = {
  allowAnyAddressToAccept: boolean;
  buyerAddress: string;
  setAllowAnyAddressToAccept: React.Dispatch<React.SetStateAction<boolean>>;
  setBuyerAddress: React.Dispatch<React.SetStateAction<string>>;
};

const AddressOption = ({
  allowAnyAddressToAccept,
  buyerAddress,
  setAllowAnyAddressToAccept,
  setBuyerAddress,
}: AddressOptionProps) => {
  const inputContainerStyle = `${
    allowAnyAddressToAccept
      ? "h-0 mt-0 opacity-0"
      : "h-[5.6rem] mt-4 opacity-100"
  } w-[calc(100%_+_2rem)] -mx-4 transition-[height,margin,opacity] ease-in-out
      duration-300 overflow-hidden`;

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = event.target.value;

    setBuyerAddress(input);
  };

  return (
    <>
      <div className="flex">
        <p className="mr-auto font-light text-sm">
          Allow any address to accept
        </p>
        <button
          aria-label="Toggle"
          onClick={() => setAllowAnyAddressToAccept(!allowAnyAddressToAccept)}
        >
          <TogglerIcon active={allowAnyAddressToAccept} />
        </button>
      </div>

      <div className={inputContainerStyle}>
        <InputContainer>
          <textarea
            className="bg-transparent focus:outline-none w-full break-all text-xl
                placeholder:text-gray-500 resize-none font-robotomono"
            placeholder={ethers.constants.AddressZero}
            onChange={handleInputChange}
            value={buyerAddress}
          />
        </InputContainer>
      </div>
    </>
  );
};

export default AddressOption;
