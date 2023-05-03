import { BigNumber, BigNumberish, ethers, Signer } from "ethers";

import {
  ERC1155_ABI,
  ERC20_ABI,
  ERC721_ABI,
} from "@/constants/blockchain/abis";
import { CreateSwapEncodeArgs } from "@/types";
import { CreateSwapArgsTypes } from "@/constants";
import { WalletState } from "@web3-onboard/core";
import { executeAsync } from "@/api/wrappers";

export const getSigner = (wallet: WalletState) => {
  return new ethers.providers.Web3Provider(wallet.provider).getSigner();
};

export const getERC20Contract = (address: string) => {
  return new ethers.Contract(address, ERC20_ABI);
};

export const getERC721Contract = (address: string) => {
  return new ethers.Contract(address, ERC721_ABI);
};

export const getERC1155Contract = (address: string) => {
  return new ethers.Contract(address, ERC1155_ABI);
};

export const encodeSwapArguments = (args: CreateSwapEncodeArgs) => {
  return ethers.utils.defaultAbiCoder.encode(
    Object.keys(args).map((k) => {
      const key = k as keyof CreateSwapEncodeArgs;
      return CreateSwapArgsTypes[key];
    }),
    Object.values(args)
  );
};

export const getSwapSignature = async (
  signer: Signer,
  encodedSwapArgs: string
) => {
  const messageHash = ethers.utils.arrayify(
    ethers.utils.keccak256(encodedSwapArgs)
  );

  return await executeAsync(() => signer.signMessage(messageHash));
};

export const getFeeInWei = (price: BigNumberish, feeInUsd: BigNumberish) => {
  const feeInFiatBn = BigNumber.from(feeInUsd);
  const priceInFiatBn = BigNumber.from(price);

  return feeInFiatBn.mul(ethers.utils.parseEther("1")).div(priceInFiatBn);
};
