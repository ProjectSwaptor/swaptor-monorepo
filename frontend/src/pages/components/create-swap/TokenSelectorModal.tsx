import { tokenOptions } from "@/config/token-options";
import { useState } from "react";

import Fader from "../Fader";
import CloseIcon from "../icons/CloseIcon";
import InputContainer from "./InputContainer";
import SelectorButton from "./SelectorButton";
import FocusLock from "react-focus-lock";
import { TokenInfo, TokenSelection } from "@/types";
import TokenOption from "./TokenOption";
import { getAddress, isAddress } from "ethers/lib/utils";
import { TokenType } from "@/constants";
import { useSetChain } from "@web3-onboard/react";
import { mumbai } from "@/config/allowed-chains";

type TokenSelectorModalProps = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  tokenSelection: TokenSelection;
  setTokenSelection: React.Dispatch<React.SetStateAction<TokenSelection>>;
};

const TokenSelectorModal = ({
  visible,
  setVisible,
  tokenSelection,
  setTokenSelection,
}: TokenSelectorModalProps) => {
  // token type should change only on token selection

  const modalContainerStyle = `fixed left-0 top-0 right-0 bottom-0 bg-black bg-opacity-30 
    flex items-center justify-center duration-150
   ${
     visible
       ? "opacity-100 z-50 backdrop-blur-sm transition-[opacity]"
       : "opacity-0 -z-50 backdrop-blur-none transition-[z-index,opacity]"
   }`;

  const [{ connectedChain }] = useSetChain();
  const [displayedTokenOptions, setDisplayedTokenOptions] = useState(
    tokenOptions[mumbai.id]
  );

  const [searchInput, setSearchInput] = useState("");

  const [unknownTokenType, setUnknownTokenType] = useState<TokenType>();
  const [displayUnknownToken, setDisplayUnknownToken] = useState(false);

  const [displayTokenTypeButton, setDisplayTokenTypeButton] = useState(false);
  const [displayTokenTypeDropdown, setDisplayTokenTypeDropdown] =
    useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value.toLowerCase();
    setSearchInput(input);

    setUnknownTokenType(undefined);
    setDisplayTokenTypeButton(false);

    const filteredTokenOptions = tokenOptions[
      connectedChain ? connectedChain.id : mumbai.id
    ].filter(
      ({ symbol, name, address }) =>
        symbol.toLowerCase().includes(input) ||
        name.toLowerCase().includes(input) ||
        address.toLowerCase().includes(input)
    );

    setDisplayedTokenOptions(filteredTokenOptions);

    if (filteredTokenOptions.length === 0 && isAddress(input)) {
      setDisplayTokenTypeButton(true);
    }
  };

  const handleTokenTypeSelection = (tokenType: TokenType) => {
    setUnknownTokenType(tokenType);
    setDisplayUnknownToken(true);
    setDisplayTokenTypeDropdown(false);
  };

  const handleTokenOptionSelection = ({
    address,
    symbol,
    tokenType,
  }: TokenInfo) => {
    const updatedTokenSelection = {
      ...tokenSelection,
      address,
      symbol,
      tokenType,
    };

    setTokenSelection(updatedTokenSelection);
    setVisible(false);
  };

  const closeModal = () => {
    setVisible(false);
  };

  return (
    <div className={modalContainerStyle} onClick={closeModal}>
      <div
        className="p-4 rounded-md bg-gray-800 w-[25rem] h-[26rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <FocusLock disabled={!visible}>
          <div className="flex pb-4">
            <p>Select Token</p>
            <button aria-label="close" className="ml-auto" onClick={closeModal}>
              <CloseIcon />
            </button>
          </div>

          <InputContainer>
            <input
              value={searchInput}
              placeholder="Search name or paste address"
              className="bg-transparent w-full focus:outline-none"
              onChange={handleInputChange}
            />
          </InputContainer>

          {displayTokenTypeButton && (
            <div>
              <button
                onClick={() =>
                  setDisplayTokenTypeDropdown(!displayTokenTypeDropdown)
                }
                className="w-full rounded-md overflow-hidden mt-2"
              >
                <SelectorButton
                  defaultText="Select Token Type"
                  textWhenSelected={unknownTokenType}
                />
              </button>
            </div>
          )}

          <Fader showChildren={displayTokenTypeDropdown}>
            <div
              className="absolute flex flex-col z-50 bg-gray-900
                        w-[25rem] rounded-b-lg font-light overflow-hidden"
            >
              {Object.keys(TokenType).map((type) => (
                <button
                  className="flex w-full p-4 transition hover:bg-gray-800"
                  key={type}
                  onClick={() =>
                    handleTokenTypeSelection(
                      TokenType[type as keyof typeof TokenType]
                    )
                  }
                >
                  {type}
                </button>
              ))}
            </div>
          </Fader>

          <hr className="w-[calc(100%_+_2rem)] -mx-4 h-[1px] bg-gray-700 border-0 mt-6 mb-2" />

          <div className="flex flex-col">
            {displayedTokenOptions.map((tokenInfo) => (
              <button
                key={tokenInfo.address}
                onClick={() => handleTokenOptionSelection(tokenInfo)}
              >
                <TokenOption
                  key={tokenInfo.address}
                  symbol={tokenInfo.symbol}
                  name={tokenInfo.name}
                  address={tokenInfo.address}
                />
              </button>
            ))}
            {displayUnknownToken && unknownTokenType !== undefined && (
              <button
                onClick={() =>
                  handleTokenOptionSelection({
                    symbol: unknownTokenType,
                    name: `Unknown ${unknownTokenType} Token`,
                    tokenType: unknownTokenType,
                    address: searchInput,
                  })
                }
              >
                <TokenOption
                  symbol={unknownTokenType}
                  name={`Unknown ${unknownTokenType} Token`}
                  address={getAddress(searchInput)}
                />
              </button>
            )}
          </div>
        </FocusLock>
      </div>
    </div>
  );
};

export default TokenSelectorModal;
