import { useEffect, useState } from "react";

import { TokenType } from "@/constants";
import { TokenSelection } from "@/types";

type TokenAmountOrIdInputProps = {
  tokenSelection: TokenSelection;
  setTokenSelection: React.Dispatch<React.SetStateAction<TokenSelection>>;
};

const TokenAmountOrIdInput = ({
  tokenSelection,
  setTokenSelection,
}: TokenAmountOrIdInputProps) => {
  const [userInput, setUserInput] = useState("");
  const tokentype = tokenSelection ? tokenSelection.tokenType : null;

  useEffect(() => {
    setUserInput("");
  }, [tokentype]);

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const input = event.target.value.replace(/,/g, ".");
    const regex = tokentype === TokenType.ERC721 ? /^\d*$/ : /^\d*\.?\d*$/;

    if (regex.test(input)) {
      const updatedTokenSelection = {
        ...tokenSelection,
        tokenData: input,
      };

      setTokenSelection(updatedTokenSelection);
      setUserInput(input);
    }
  };

  return (
    <input
      className="text-[2rem] text-white placeholder:text-gray-500 font-light 
                  bg-transparent w-full focus:outline-none cursor-text truncate"
      value={userInput}
      placeholder="0"
      onChange={handleInputChange}
    />
  );
};

export default TokenAmountOrIdInput;
