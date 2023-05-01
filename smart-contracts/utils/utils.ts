import { ethers, upgrades } from "hardhat";
import { BigNumber, Contract, ContractTransaction } from "ethers/lib/ethers";
import { Signer, BigNumberish } from "ethers";
import { CHAINLINK_PRICE_FEED_ETH_USD_MUMBAI } from "./constants";

export const deployContract = async <T extends Contract>(
  factoryName: string,
  args?: any[]
) => {
  const Factory = await ethers.getContractFactory(factoryName);
  const contract = args
    ? await Factory.deploy(...args)
    : await Factory.deploy();
  await contract.deployed();

  return contract as T;
};

export const deployUpgradeableContract = async <T extends Contract>(
  factoryName: string,
  args?: any[],
  initializer?: string
) => {
  const Factory = await ethers.getContractFactory(factoryName);

  let contract: T;

  if (args) {
    if (initializer) {
      contract = (await upgrades.deployProxy(Factory, args, {
        initializer,
      })) as T;
    } else {
      contract = (await upgrades.deployProxy(Factory, args)) as T;
    }
  } else {
    contract = initializer
      ? ((await upgrades.deployProxy(Factory, {
          initializer,
        })) as T)
      : ((await upgrades.deployProxy(Factory)) as T);
  }

  await contract.deployed();

  return contract;
};

export const encodeSwapArguments = (
  id: string,
  swapType: SwapType,
  seller: string,
  buyer: string,
  offeredERC20: string,
  offeredERC20Amount: BigNumberish,
  wantedERC20: string,
  wantedERC20Amount: BigNumberish,
  chainId: BigNumberish,
  expirationTime: BigNumberish
) => {
  return ethers.utils.defaultAbiCoder.encode(
    [
      "string",
      "uint8",
      "address",
      "address",
      "address",
      "uint256",
      "address",
      "uint256",
      "uint256",
      "uint256",
    ],
    [
      id,
      swapType,
      seller,
      buyer,
      offeredERC20,
      offeredERC20Amount,
      wantedERC20,
      wantedERC20Amount,
      chainId,
      expirationTime,
    ]
  );
};

export const getSwapSignature = async (
  signer: Signer,
  swapArguments: string
) => {
  const hash = ethers.utils.keccak256(swapArguments);

  return signer.signMessage(ethers.utils.arrayify(hash));
};

export enum SwapType {
  ERC20_FOR_ERC20,
  ERC20_FOR_ERC721,
  ERC721_FOR_ERC20,
  ERC721_FOR_ERC721,
}

export const getFeeInWei = (
  feeInUsd: BigNumberish,
  ethPriceInFiat: BigNumberish
) => {
  const feeInFiatBn = BigNumber.from(feeInUsd);
  const ethPriceInFiatBn = BigNumber.from(ethPriceInFiat);

  return feeInFiatBn.mul(ethers.utils.parseEther("1")).div(ethPriceInFiatBn);
};

export const getSwapParticipantEventArgs = async (tx: ContractTransaction) => {
  const [
    idSwapParticipants,
    sellerAddressSwapParticipants,
    buyerAddressSwapParticipants,
  ] = (await tx.wait()).events?.filter((e) => e.event === "SwapParticipants")[0]
    ?.args!;

  return {
    idSwapParticipants,
    sellerAddressSwapParticipants,
    buyerAddressSwapParticipants,
  };
};

export const getSwapDetailsEventArgsByHashedId = async (
  tx: ContractTransaction,
  hashedId: string
) => {
  const [
    idSwapDetails,
    offeredTokenAddressSwapDetails,
    wantedTokenAddressSwapDetails,
    offeredTokenDataSwapDetails,
    wantedTokenDataSwapDetails,
    expirationTimeSwapDetails,
  ] = (await tx.wait()).events?.filter(
    (e) => e.event === "SwapDetails" && e.args[0].hash === hashedId
  )[0].args!;

  return {
    idSwapDetails,
    offeredTokenAddressSwapDetails,
    wantedTokenAddressSwapDetails,
    offeredTokenDataSwapDetails,
    wantedTokenDataSwapDetails,
    expirationTimeSwapDetails,
  };
};

export const getNetworkPriceFeed = (networkName: string) => {
  if (networkName === "mumbai") {
    return CHAINLINK_PRICE_FEED_ETH_USD_MUMBAI;
  }
};
