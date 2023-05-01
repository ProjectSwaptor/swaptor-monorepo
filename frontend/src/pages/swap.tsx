import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import { TokenSelection } from "@/types";

import { TOKENS_TO_SWAP_TYPE, TokenType } from "@/constants";
import TokenSelectorButton from "./components/create-swap/TokenSelectorButton";
import BalanceDisplay from "./components/create-swap/BalanceDisplay";
import TokenAmountOrIdInput from "./components/create-swap/TokenAmountOrIdInput";
import TokenSelectorModal from "./components/create-swap/TokenSelectorModal";
import ConnectWalletButton from "./components/create-swap/ConnectWalletButton";
import InfoPanel from "./components/create-swap/InfoPanel";
import InputContainer from "./components/create-swap/InputContainer";
import OptionContainer from "./components/create-swap/OptionContainer";
import AddressOption from "./components/create-swap/AddressOption";
import SwapButton from "./components/create-swap/SwapButton";
import InfoButton from "./components/create-swap/InfoButton";
import { getAddress, isAddress } from "ethers/lib/utils";
import Navbar from "./sections/Navbar";
import Container from "./components/Container";
import Wrapper from "./components/Wrapper";
import DownCircleArrowIcon from "./components/icons/DownCircleArrowIcon";
import SwitchChain from "./components/SwitchChain";
import { getERC20Contract, getSigner } from "@/utils/blockchain";
import Head from "next/head";
import { FRONTEND_URL } from "@/environment";

const CreateSwap = () => {
  const [{ wallet, connecting }] = useConnectWallet();
  const [{ chains, connectedChain }] = useSetChain();

  const [balance, setBalance] = useState<string | undefined>(undefined);

  const [buyerAddress, setBuyerAddress] = useState<string>("");
  const [allowAnyAddressToAccept, setAllowAnyAddressToAccept] = useState(true);

  const [wantedTokenSelection, setWantedTokenSelection] =
    useState<TokenSelection>({});
  const [offeredTokenSelection, setOfferedTokenSelection] =
    useState<TokenSelection>({});

  const [offeredTokenSelectorVisible, setOfferedTokenSectorVisible] =
    useState(false);
  const [wantedTokenSelectorVisible, setWantedTokenSectorVisible] =
    useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      const signer = getSigner(wallet!);
      const signerAddress = await signer.getAddress();
      const token = getERC20Contract(offeredTokenSelection.address!);
      const balance = await token.connect(signer).balanceOf(signerAddress);

      setBalance(ethers.utils.formatEther(balance));
    };

    if (
      wallet &&
      connectedChain &&
      connectedChain.id === chains[0].id &&
      offeredTokenSelection.address &&
      offeredTokenSelection.tokenType === TokenType.ERC20
    ) {
      fetchBalance();
    }
  }, [offeredTokenSelection, wallet, chains, connectedChain]);

  const resetForm = () => {
    setBalance(undefined);

    setBuyerAddress("");
    setAllowAnyAddressToAccept(true);

    setWantedTokenSelection({});
    setOfferedTokenSelection({});

    setOfferedTokenSectorVisible(false);
    setWantedTokenSectorVisible(false);
  };

  return (
    <Container>
      <Head>
        <title>Swaptor Interface</title>
        <link rel="icon" href="/swaptor-logo.svg" type="image/svg+xml" />
        <meta
          name="description"
          content="Swap ERC20 tokens or NFTs."
          key="desc"
        />
        <meta property="og:title" content="Swaptor Interface" />
        <meta
          property="og:description"
          content="Create a swap with ERC20 tokens or NFTs and share it with your peers."
        />
        <meta
          property="og:image"
          content={`${FRONTEND_URL}/swaptor-hero.png`}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Head>
      <Wrapper>
        <Navbar />
      </Wrapper>
      <div className="flex justify-center items-center bg-gray-900 mt-[6rem] md:mt-[5rem]">
        <div
          className="flex flex-col justify-center items-center bg-gray-800 relative
                    space-y-1 my-auto p-4 rounded-xl max-w-[26rem] sm:w-[30rem]"
        >
          <div
            className="absolute flex items-center justify-center fill-gray-900 text-gray-600 h-7 w-7 
                          inset-y-[11.16rem]"
          >
            <DownCircleArrowIcon />
          </div>

          <div className="flex flex-row justify-between w-full pt-1 pb-3 px-1">
            <div className="text-left leading-none">Create Swap</div>
            <InfoPanel />
          </div>

          <InputContainer>
            <div className="flex w-full justify-between">
              <button onClick={() => setOfferedTokenSectorVisible(true)}>
                <TokenSelectorButton tokenSelection={offeredTokenSelection} />
              </button>

              {balance && (
                <div className="hidden sm:flex sm:w-2/5 justify-end">
                  <BalanceDisplay balance={balance} />
                </div>
              )}
            </div>

            {balance && (
              <div className="flex sm:hidden">
                <BalanceDisplay balance={balance} />
              </div>
            )}

            <TokenAmountOrIdInput
              tokenSelection={offeredTokenSelection}
              setTokenSelection={setOfferedTokenSelection}
            />

            <TokenSelectorModal
              visible={offeredTokenSelectorVisible}
              setVisible={setOfferedTokenSectorVisible}
              tokenSelection={offeredTokenSelection}
              setTokenSelection={setOfferedTokenSelection}
            />
          </InputContainer>

          <InputContainer>
            <button onClick={() => setWantedTokenSectorVisible(true)}>
              <TokenSelectorButton tokenSelection={wantedTokenSelection} />
            </button>

            <TokenAmountOrIdInput
              tokenSelection={wantedTokenSelection}
              setTokenSelection={setWantedTokenSelection}
            />

            <TokenSelectorModal
              visible={wantedTokenSelectorVisible}
              setVisible={setWantedTokenSectorVisible}
              tokenSelection={wantedTokenSelection}
              setTokenSelection={setWantedTokenSelection}
            />
          </InputContainer>

          <OptionContainer>
            <AddressOption
              buyerAddress={buyerAddress}
              setBuyerAddress={setBuyerAddress}
              allowAnyAddressToAccept={allowAnyAddressToAccept}
              setAllowAnyAddressToAccept={setAllowAnyAddressToAccept}
            />
          </OptionContainer>

          <div className="pt-2 w-full">
            {(() => {
              if (!wallet && !connecting) {
                return <ConnectWalletButton />;
              } else if (connectedChain && connectedChain.id !== chains[0].id) {
                return (
                  <SwitchChain
                    text="Switch Chain"
                    chainId={chains[0].id}
                    chainNamespace={chains[0].namespace}
                  />
                );
              } else if (
                !offeredTokenSelection.address ||
                !wantedTokenSelection.address
              ) {
                return <InfoButton info={"Select Token"} />;
              } else if (
                !offeredTokenSelection.tokenData ||
                !wantedTokenSelection.tokenData
              ) {
                return <InfoButton info={"Enter Token Data"} />;
              } else if (!allowAnyAddressToAccept && !isAddress(buyerAddress)) {
                return <InfoButton info={"Enter Buyer Address"} />;
              } else {
                return (
                  <SwapButton
                    resetForm={resetForm}
                    swapType={
                      TOKENS_TO_SWAP_TYPE[
                        offeredTokenSelection.tokenType || TokenType.ERC20
                      ][wantedTokenSelection.tokenType || TokenType.ERC20]
                    }
                    buyer={
                      isAddress(buyerAddress)
                        ? getAddress(buyerAddress) // adds zero prefix if it's missing
                        : ethers.constants.AddressZero
                    }
                    offeredToken={{
                      address: offeredTokenSelection.address,
                      tokenData: offeredTokenSelection.tokenData,
                    }}
                    wantedToken={{
                      address: wantedTokenSelection.address,
                      tokenData: wantedTokenSelection.tokenData,
                    }}
                  />
                );
              }
            })()}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CreateSwap;
