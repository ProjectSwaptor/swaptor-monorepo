import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import {
  BigNumber,
  BigNumberish,
  ContractTransaction,
} from "ethers";
import { ethers } from "hardhat";

export enum AssetTypes {
  ERC20,
  ERC721,
  ERC1155,
}

export type Addressable = {
  address: string;
};


export type HardhatEthers = typeof ethers & HardhatEthersHelpers;

export type Asset = {
  assetType: typeof AssetTypes[keyof typeof AssetTypes];
  assetAddress: string;
  assetId: BigNumberish;
  assetAmount: BigNumberish;
};

export type CreateDealEventArgs = {
  dealId: BigNumber;
  offerer: string;
  assetOffered: Asset;
  assetClaiming: Asset;
};

export const assetsFormat = {
  type: "tuple[]",
  components: [
    { name: "assetType", type: "uint8" },
    { name: "assetAddress", type: "address" },
    { name: "assetId", type: "uint256" },
    { name: "assetAmount", type: "uint256" },
  ],
};

export const mintAssets = async (
  assets: Asset[],
  receiver: Addressable
) => {
  for (const asset of assets) {
    const {
      assetType,
      assetAddress,
      assetId,
      assetAmount,
    } = asset;

    switch (assetType) {
      case AssetTypes.ERC20: {
        const erc20 = await ethers.getContractAt(
          "TestERC20",
          assetAddress
        );
        await erc20.mint(receiver.address, assetAmount);
        break;
      }
      case AssetTypes.ERC721: {
        const erc721 = await ethers.getContractAt(
          "TestERC721",
          assetAddress
        );
        await erc721.mint(receiver.address, [assetId]);
        break;
      }
      case AssetTypes.ERC1155: {
        const erc1155 = await ethers.getContractAt(
          "TestERC1155",
          assetAddress
        );
        await erc1155.mint(
          receiver.address,
          [assetId],
          [assetAmount]
        );
      }
    }
  }
};

export const approveAssets = async (
  assets: Asset[],
  approver: SignerWithAddress,
  receiver: Addressable
) => {
  for (const asset of assets) {
    const {
      assetType,
      assetAddress,
      assetId,
      assetAmount,
    } = asset;

    switch (assetType) {
      case AssetTypes.ERC20: {
        const erc20 = await ethers.getContractAt(
          "TestERC20",
          assetAddress
        );
        await erc20
          .connect(approver)
          .approve(receiver.address, assetAmount);
        break;
      }
      case AssetTypes.ERC721: {
        const erc721 = await ethers.getContractAt(
          "TestERC721",
          assetAddress
        );
        await erc721
          .connect(approver)
          .approve(receiver.address, assetId);
        break;
      }
      case AssetTypes.ERC1155: {
        const erc1155 = await ethers.getContractAt(
          "TestERC1155",
          assetAddress
        );
        await erc1155
          .connect(approver)
          .setApprovalForAll(receiver.address, true);
      }
    }
  }
};

export const getBalance = async (
  asset: Asset,
  target: Addressable
) => {
  let balance: BigNumber = BigNumber.from("0");

  const { assetType, assetAddress, assetId } = asset;

  switch (assetType) {
    case AssetTypes.ERC20: {
      const erc20 = await ethers.getContractAt(
        "TestERC20",
        assetAddress
      );
      balance = await erc20.balanceOf(target.address);

      break;
    }
    case AssetTypes.ERC721: {
      const erc721 = await ethers.getContractAt(
        "TestERC721",
        assetAddress
      );
      balance = await erc721.balanceOf(target.address);

      break;
    }
    case AssetTypes.ERC1155: {
      const erc1155 = await ethers.getContractAt(
        "TestERC1155",
        assetAddress
      );
      balance = await erc1155.balanceOf(
        target.address,
        assetId
      );
    }
  }
  return balance;
};

// removes redundant object properties from Asset struct retrieved when reading the contract
export const stripRetrievedAsset = (
  asset: Asset
): Asset => {
  const { assetType, assetAddress, assetId, assetAmount } =
    asset;
  return { assetType, assetAddress, assetId, assetAmount };
};

export const getDealCreatedEventArgs = async (
  tx: ContractTransaction
): Promise<CreateDealEventArgs> => {
  let { dealId, offerer, assetOffered, assetClaiming } = (
    await tx.wait()
  ).events?.filter((e) => e.event === "CreateDeal")[0]
    ?.args!;

  assetOffered = stripRetrievedAsset(assetOffered);
  assetClaiming = stripRetrievedAsset(assetClaiming);

  return {
    dealId,
    offerer,
    assetOffered,
    assetClaiming,
  };
};

export const deployTestERC20 = async (hardhatEthers: HardhatEthers) => {
  const TestERC20 = await hardhatEthers.getContractFactory("TestERC20");
  const testERC20 = await TestERC20.deploy();
  await testERC20.deployed();

  return testERC20;
};

export const deployTestERC721 = async (hardhatEthers: HardhatEthers) => {
  const TestERC721 = await hardhatEthers.getContractFactory("TestERC721");
  const testERC721 = await TestERC721.deploy();
  await testERC721.deployed();

  return testERC721;
};

export const deployTestERC1155 = async (hardhatEthers: HardhatEthers) => {
  const TestERC1155 = await hardhatEthers.getContractFactory("TestERC1155");
  const testERC1155 = await TestERC1155.deploy();
  await testERC1155.deployed();

  return testERC1155;
};

export const getSimpleERC20Asset = async (hardhatEthers: HardhatEthers) => {
  const address = (await deployTestERC20(hardhatEthers)).address;

  return {
    assetType: AssetTypes.ERC20,
    assetAddress: address,
    assetId: BigNumber.from(1),
    assetAmount: BigNumber.from(5),
  };
};

export const getSimpleERC721Asset = async (hardhatEthers: HardhatEthers) => {
  const address = (await deployTestERC721(hardhatEthers)).address;

  return {
    assetType: AssetTypes.ERC721,
    assetAddress: address,
    assetId: BigNumber.from(2),
    assetAmount: BigNumber.from(1),
  };
};

export const getSimpleERC1155Asset = async (hardhatEthers: HardhatEthers) => {
  const address = (await deployTestERC1155(hardhatEthers)).address;

  return {
    assetType: AssetTypes.ERC1155,
    assetAddress: address,
    assetId: BigNumber.from(3),
    assetAmount: BigNumber.from(2),
  };
};
