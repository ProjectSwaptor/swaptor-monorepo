import { ethers } from "hardhat";
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import {
  AggregatorV3Interface,
  Swaptor,
  TestERC20,
  TestERC721,
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { FakeContract, smock } from "@defi-wonderland/smock";
import {
  deployUpgradeableContract,
  encodeSwapArguments,
  getFeeInWei,
  getSwapDetailsEventArgsByHashedId,
  getSwapParticipantEventArgs,
  getSwapSignature,
  SwapType,
} from "../utils/utils";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ONE_DAY_IN_SECONDS, FEE_IN_USD } from "../utils/constants";

describe("Swaptor", () => {
  let swaptor: Swaptor;

  let deployer: SignerWithAddress;
  let accounts: SignerWithAddress[];

  let mockPriceFeed: FakeContract<AggregatorV3Interface>;

  const chainlinkEthPrice = "200000000000"; // 1 ETHER = 2000 $ - This number is the value that Chainlink would return

  async function prepareForTesting(
    offeredToken: TestERC20 | TestERC721,
    wantedToken: TestERC20 | TestERC721,
    typeOfSwap: SwapType
  ) {
    [deployer, ...accounts] = await ethers.getSigners();

    mockPriceFeed = await smock.fake("AggregatorV3Interface");
    mockPriceFeed.latestRoundData.returns([0, chainlinkEthPrice, 0, 0, 0]);

    const freeTrialEndTime = (await time.latest()) + ONE_DAY_IN_SECONDS;
    swaptor = await deployUpgradeableContract<Swaptor>("Swaptor", [
      FEE_IN_USD,
      freeTrialEndTime,
      mockPriceFeed.address,
    ]);

    const swapType = typeOfSwap;
    const swapId = "123";
    const chainId = "31337";
    const expirationTime = (await time.latest()) + 60;

    const seller = accounts[0];
    const offeredTokenAddress = offeredToken.address;
    const offeredTokenData = 1;

    await offeredToken.mint(
      seller.address,
      swapType == SwapType.ERC20_FOR_ERC20 ||
        swapType == SwapType.ERC20_FOR_ERC721
        ? offeredTokenData
        : [offeredTokenData]
    );

    const buyer = accounts[1];
    const wantedTokenAddress = wantedToken.address;
    const wantedTokenData = 1;

    await wantedToken.mint(
      buyer.address,
      swapType == SwapType.ERC20_FOR_ERC20 ||
        swapType == SwapType.ERC721_FOR_ERC20
        ? wantedTokenData
        : [wantedTokenData]
    );

    const swapArguments = encodeSwapArguments(
      swapId,
      swapType,
      seller.address,
      buyer.address,
      offeredTokenAddress,
      offeredTokenData,
      wantedTokenAddress,
      wantedTokenData,
      chainId,
      expirationTime
    );
    const signature = await getSwapSignature(seller, swapArguments);

    return {
      seller,
      offeredTokenAddress,
      offeredTokenData,
      buyer,
      wantedTokenAddress,
      wantedTokenData,
      swapId,
      swapType,
      chainId,
      expirationTime,
      swapArguments,
      signature,
    };
  }

  describe("ERC20 to ERC20 swap tests", () => {
    let testERC20A: TestERC20;
    let testERC20B: TestERC20;

    async function prepareForTestingErc20ToErc20Swap() {
      const TestERC20 = await ethers.getContractFactory("TestERC20");

      testERC20A = await TestERC20.deploy();
      await testERC20A.deployed();

      testERC20B = await TestERC20.deploy();
      await testERC20B.deployed();

      return await prepareForTesting(
        testERC20A,
        testERC20B,
        SwapType.ERC20_FOR_ERC20
      );
    }

    it("should successfully execute erc20 to erc20 swap if the buyer is specified", async () => {
      const {
        swapId,
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        expirationTime,
        swapArguments,
        signature,
      } = await loadFixture(prepareForTestingErc20ToErc20Swap);

      await testERC20A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20B.connect(buyer).approve(swaptor.address, wantedTokenData);

      const swapTx = await swaptor
        .connect(buyer)
        .swapERC20ForERC20(swapArguments, signature, { value: FEE_IN_USD });

      expect((await testERC20A.balanceOf(buyer.address)).eq(offeredTokenData))
        .to.be.true;
      expect((await testERC20B.balanceOf(seller.address)).eq(wantedTokenData))
        .to.be.true;
      expect((await ethers.provider.getBalance(swaptor.address)).eq(FEE_IN_USD))
        .to.be.true;

      const swapIdHashed = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(swapId)
      );

      const {
        idSwapParticipants,
        sellerAddressSwapParticipants,
        buyerAddressSwapParticipants,
      } = await getSwapParticipantEventArgs(swapTx);

      const {
        idSwapDetails,
        offeredTokenAddressSwapDetails,
        wantedTokenAddressSwapDetails,
        offeredTokenDataSwapDetails,
        wantedTokenDataSwapDetails,
        expirationTimeSwapDetails,
      } = await getSwapDetailsEventArgsByHashedId(swapTx, swapIdHashed);

      expect(idSwapParticipants.hash).to.be.equal(idSwapDetails.hash);
      expect(idSwapParticipants.hash).to.be.equal(swapIdHashed);

      expect(sellerAddressSwapParticipants).to.be.equal(seller.address);
      expect(buyerAddressSwapParticipants).to.be.equal(buyer.address);
      expect(offeredTokenAddressSwapDetails).to.be.equal(offeredTokenAddress);
      expect(wantedTokenAddressSwapDetails).to.be.equal(wantedTokenAddress);
      expect(offeredTokenDataSwapDetails).to.be.equal(offeredTokenData);
      expect(wantedTokenDataSwapDetails).to.be.equal(wantedTokenData);
      expect(expirationTimeSwapDetails).to.be.equal(expirationTime);
    });

    it("shouldn't successfully execute erc20 to erc20 swap if the specified buyer doesn't match the msg.sender", async () => {
      const {
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        swapId,
        swapType,
        chainId,
        expirationTime,
      } = await loadFixture(prepareForTestingErc20ToErc20Swap);

      const specifiedBuyerAddress = accounts[2].address;
      const swapArguments = encodeSwapArguments(
        swapId,
        swapType,
        seller.address,
        specifiedBuyerAddress,
        offeredTokenAddress,
        offeredTokenData,
        wantedTokenAddress,
        wantedTokenData,
        chainId,
        expirationTime
      );
      const signature = await getSwapSignature(seller, swapArguments);

      await testERC20A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20B.connect(buyer).approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC20ForERC20(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "UnauthorizedBuyer");
    });

    it("should successfully execute erc20 to erc20 swap if the buyer isn't specified", async () => {
      const {
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        swapId,
        swapType,
        chainId,
        expirationTime,
      } = await loadFixture(prepareForTestingErc20ToErc20Swap);

      const swapArguments = encodeSwapArguments(
        swapId,
        swapType,
        seller.address,
        ethers.constants.AddressZero,
        offeredTokenAddress,
        offeredTokenData,
        wantedTokenAddress,
        wantedTokenData,
        chainId,
        expirationTime
      );
      const signature = await getSwapSignature(seller, swapArguments);

      await testERC20A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20B.connect(buyer).approve(swaptor.address, wantedTokenData);

      await swaptor
        .connect(buyer)
        .swapERC20ForERC20(swapArguments, signature, { value: FEE_IN_USD });

      expect((await testERC20A.balanceOf(buyer.address)).eq(offeredTokenData))
        .to.be.true;
      expect((await testERC20B.balanceOf(seller.address)).eq(wantedTokenData))
        .to.be.true;
      expect((await ethers.provider.getBalance(swaptor.address)).eq(FEE_IN_USD))
        .to.be.true;
    });

    it("shouldn't successfully execute erc20 to erc20 swap if signature is invalid", async () => {
      const {
        seller,
        offeredTokenData,
        buyer,
        wantedTokenData,
        swapArguments,
      } = await loadFixture(prepareForTestingErc20ToErc20Swap);

      const fakeSigner = accounts[1];
      const signature = await getSwapSignature(fakeSigner, swapArguments);

      await testERC20A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20B.connect(buyer).approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC20ForERC20(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "InvalidSignature");
    });

    it("shouldn't successfully execute erc20 to erc20 swap if offer has expired", async () => {
      const {
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        swapId,
        swapType,
        chainId,
      } = await loadFixture(prepareForTestingErc20ToErc20Swap);

      const expirationTime = (await time.latest()) - 1;
      const swapArguments = encodeSwapArguments(
        swapId,
        swapType,
        seller.address,
        buyer.address,
        offeredTokenAddress,
        offeredTokenData,
        wantedTokenAddress,
        wantedTokenData,
        chainId,
        expirationTime
      );
      const signature = await getSwapSignature(seller, swapArguments);

      await testERC20A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20B.connect(buyer).approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC20ForERC20(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "SwapExpired");
    });

    it("shouldn't successfully execute erc20 to erc20 swap if chainId is invalid", async () => {
      const {
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        swapId,
        swapType,
        expirationTime,
      } = await loadFixture(prepareForTestingErc20ToErc20Swap);

      const chainId = "1";
      const swapArguments = encodeSwapArguments(
        swapId,
        swapType,
        seller.address,
        buyer.address,
        offeredTokenAddress,
        offeredTokenData,
        wantedTokenAddress,
        wantedTokenData,
        chainId,
        expirationTime
      );
      const signature = await getSwapSignature(seller, swapArguments);

      await testERC20A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20B.connect(buyer).approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC20ForERC20(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "InvalidChainId");
    });

    it("shouldn't successfully execute erc20 to erc20 swap if signature has already been used", async () => {
      const {
        seller,
        offeredTokenData,
        buyer,
        wantedTokenData,
        swapArguments,
        signature,
      } = await loadFixture(prepareForTestingErc20ToErc20Swap);

      await testERC20A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20B.connect(buyer).approve(swaptor.address, wantedTokenData);

      await swaptor
        .connect(buyer)
        .swapERC20ForERC20(swapArguments, signature, { value: FEE_IN_USD });

      await testERC20A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20B.connect(buyer).approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC20ForERC20(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "SignatureUsed");
    });

    it("shouldn't execute erc20-erc20 swap if trial period has expired and msg.value is lower than FEE_IN_USD", async () => {
      const {
        seller,
        offeredTokenData,
        buyer,
        wantedTokenData,
        swapArguments,
        signature,
      } = await loadFixture(prepareForTestingErc20ToErc20Swap);

      await swaptor.setFreeTrialEndTime((await time.latest()) - 1);

      await testERC20A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20B.connect(buyer).approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC20ForERC20(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "InsufficientFee");
    });

    it("should execute erc20-erc20 swap if trial period has expired and msg.value is valid", async () => {
      const {
        seller,
        offeredTokenData,
        buyer,
        wantedTokenData,
        swapArguments,
        signature,
      } = await loadFixture(prepareForTestingErc20ToErc20Swap);

      const feeInWei = getFeeInWei(FEE_IN_USD, chainlinkEthPrice);
      await swaptor.setFreeTrialEndTime((await time.latest()) - 1);

      await testERC20A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20B.connect(buyer).approve(swaptor.address, wantedTokenData);

      await swaptor.connect(buyer).swapERC20ForERC20(swapArguments, signature, {
        value: feeInWei,
      });

      expect((await ethers.provider.getBalance(swaptor.address)).eq(feeInWei))
        .to.be.true;
    });
  });

  describe("ERC20 to ERC721 swap tests", () => {
    let testERC20: TestERC20;
    let testERC721: TestERC721;

    async function prepareForTestingErc20ToErc721Swap() {
      const TestERC20 = await ethers.getContractFactory("TestERC20");
      const TestERC721 = await ethers.getContractFactory("TestERC721");

      testERC20 = await TestERC20.deploy();
      await testERC20.deployed();

      testERC721 = await TestERC721.deploy();
      await testERC721.deployed();

      return await prepareForTesting(
        testERC20,
        testERC721,
        SwapType.ERC20_FOR_ERC721
      );
    }

    it("should successfully execute erc20 to erc721 swap if the buyer is specified", async () => {
      const {
        swapId,
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        expirationTime,
        swapArguments,
        signature,
      } = await loadFixture(prepareForTestingErc20ToErc721Swap);

      await testERC20
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721.connect(buyer).approve(swaptor.address, wantedTokenData);

      const expectedSellerBalanceOfWantedToken = (
        await testERC721.balanceOf(seller.address)
      ).add(1);

      const swapTx = await swaptor
        .connect(buyer)
        .swapERC20ForERC721(swapArguments, signature, { value: FEE_IN_USD });

      expect((await testERC20.balanceOf(buyer.address)).eq(offeredTokenData)).to
        .be.true;
      expect(
        (await testERC721.balanceOf(seller.address)).eq(
          expectedSellerBalanceOfWantedToken
        )
      ).to.be.true;
      expect((await ethers.provider.getBalance(swaptor.address)).eq(FEE_IN_USD))
        .to.be.true;

      const swapIdHashed = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(swapId)
      );

      const {
        idSwapParticipants,
        sellerAddressSwapParticipants,
        buyerAddressSwapParticipants,
      } = await getSwapParticipantEventArgs(swapTx);

      const {
        idSwapDetails,
        offeredTokenAddressSwapDetails,
        wantedTokenAddressSwapDetails,
        offeredTokenDataSwapDetails,
        wantedTokenDataSwapDetails,
        expirationTimeSwapDetails,
      } = await getSwapDetailsEventArgsByHashedId(swapTx, swapIdHashed);

      expect(idSwapParticipants.hash).to.be.equal(idSwapDetails.hash);
      expect(idSwapParticipants.hash).to.be.equal(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(swapId))
      );

      expect(sellerAddressSwapParticipants).to.be.equal(seller.address);
      expect(buyerAddressSwapParticipants).to.be.equal(buyer.address);
      expect(offeredTokenAddressSwapDetails).to.be.equal(offeredTokenAddress);
      expect(wantedTokenAddressSwapDetails).to.be.equal(wantedTokenAddress);
      expect(offeredTokenDataSwapDetails).to.be.equal(offeredTokenData);
      expect(wantedTokenDataSwapDetails).to.be.equal(wantedTokenData);
      expect(expirationTimeSwapDetails).to.be.equal(expirationTime);
    });

    it("shouldn't successfully execute erc20 to erc721 swap if the specified buyer doesn't match the msg.sender", async () => {
      const {
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        swapId,
        swapType,
        chainId,
        expirationTime,
      } = await loadFixture(prepareForTestingErc20ToErc721Swap);

      const specifiedBuyerAddress = accounts[2].address;
      const swapArguments = encodeSwapArguments(
        swapId,
        swapType,
        seller.address,
        specifiedBuyerAddress,
        offeredTokenAddress,
        offeredTokenData,
        wantedTokenAddress,
        wantedTokenData,
        chainId,
        expirationTime
      );
      const signature = await getSwapSignature(seller, swapArguments);

      await testERC20
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721.connect(buyer).approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC20ForERC721(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "UnauthorizedBuyer");
    });

    it("should successfully execute erc20 to erc721 swap if the buyer isn't specified", async () => {
      const {
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        swapId,
        swapType,
        chainId,
        expirationTime,
      } = await loadFixture(prepareForTestingErc20ToErc721Swap);

      const swapArguments = encodeSwapArguments(
        swapId,
        swapType,
        seller.address,
        ethers.constants.AddressZero,
        offeredTokenAddress,
        offeredTokenData,
        wantedTokenAddress,
        wantedTokenData,
        chainId,
        expirationTime
      );
      const signature = await getSwapSignature(seller, swapArguments);

      await testERC20
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721.connect(buyer).approve(swaptor.address, wantedTokenData);

      const expectedSellerBalanceOfWantedToken = (
        await testERC721.balanceOf(seller.address)
      ).add(1);

      await swaptor
        .connect(buyer)
        .swapERC20ForERC721(swapArguments, signature, { value: FEE_IN_USD });

      expect((await testERC20.balanceOf(buyer.address)).eq(offeredTokenData)).to
        .be.true;
      expect(
        (await testERC721.balanceOf(seller.address)).eq(
          expectedSellerBalanceOfWantedToken
        )
      ).to.be.true;
      expect((await ethers.provider.getBalance(swaptor.address)).eq(FEE_IN_USD))
        .to.be.true;
    });

    it("shouldn't successfully execute erc20 to erc721 swap if signature is invalid", async () => {
      const {
        seller,
        offeredTokenData,
        buyer,
        wantedTokenData,
        swapArguments,
      } = await loadFixture(prepareForTestingErc20ToErc721Swap);

      const fakeSigner = accounts[1];
      const signature = await getSwapSignature(fakeSigner, swapArguments);

      await testERC20
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721.connect(buyer).approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC20ForERC721(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "InvalidSignature");
    });

    it("shouldn't successfully execute erc20 to erc721 swap if offer has expired", async () => {
      const {
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        swapId,
        swapType,
        chainId,
      } = await loadFixture(prepareForTestingErc20ToErc721Swap);

      const expirationTime = (await time.latest()) - 1;
      const swapArguments = encodeSwapArguments(
        swapId,
        swapType,
        seller.address,
        buyer.address,
        offeredTokenAddress,
        offeredTokenData,
        wantedTokenAddress,
        wantedTokenData,
        chainId,
        expirationTime
      );
      const signature = await getSwapSignature(seller, swapArguments);

      await testERC20
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721.connect(buyer).approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC20ForERC721(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "SwapExpired");
    });

    it("shouldn't successfully execute erc20 to erc721 swap if chainId is invalid", async () => {
      const {
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        swapId,
        swapType,
        expirationTime,
      } = await loadFixture(prepareForTestingErc20ToErc721Swap);

      const chainId = "1";
      const swapArguments = encodeSwapArguments(
        swapId,
        swapType,
        seller.address,
        buyer.address,
        offeredTokenAddress,
        offeredTokenData,
        wantedTokenAddress,
        wantedTokenData,
        chainId,
        expirationTime
      );
      const signature = await getSwapSignature(seller, swapArguments);

      await testERC20
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721.connect(buyer).approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC20ForERC721(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "InvalidChainId");
    });

    it("shouldn't successfully execute erc20 to erc721 swap if signature has already been used", async () => {
      const {
        seller,
        offeredTokenData,
        buyer,
        wantedTokenData,
        swapArguments,
        signature,
      } = await loadFixture(prepareForTestingErc20ToErc721Swap);

      await testERC20
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721.connect(buyer).approve(swaptor.address, wantedTokenData);

      await swaptor
        .connect(buyer)
        .swapERC20ForERC721(swapArguments, signature, { value: FEE_IN_USD });

      await expect(
        swaptor
          .connect(buyer)
          .swapERC20ForERC721(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "SignatureUsed");
    });

    it("shouldn't execute erc20-erc721 swap if trial period has expired and msg.value is lower than FEE_IN_USD", async () => {
      const {
        seller,
        offeredTokenData,
        buyer,
        wantedTokenData,
        swapArguments,
        signature,
      } = await loadFixture(prepareForTestingErc20ToErc721Swap);

      await swaptor.setFreeTrialEndTime((await time.latest()) - 1);

      await testERC20
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721.connect(buyer).approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC20ForERC721(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "InsufficientFee");
    });

    it("should execute erc20-erc721 swap if trial period has expired and msg.value is valid", async () => {
      const {
        seller,
        offeredTokenData,
        buyer,
        wantedTokenData,
        swapArguments,
        signature,
      } = await loadFixture(prepareForTestingErc20ToErc721Swap);

      const feeInWei = getFeeInWei(FEE_IN_USD, chainlinkEthPrice);
      await swaptor.setFreeTrialEndTime((await time.latest()) - 1);

      await testERC20
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721.connect(buyer).approve(swaptor.address, wantedTokenData);

      await swaptor
        .connect(buyer)
        .swapERC20ForERC721(swapArguments, signature, {
          value: feeInWei,
        });

      expect((await ethers.provider.getBalance(swaptor.address)).eq(feeInWei))
        .to.be.true;
    });
  });

  describe("ERC721 to ERC20 swap tests", () => {
    let testERC721: TestERC721;
    let testERC20: TestERC20;

    async function prepareForTestingErc721ToErc20Swap() {
      const TestERC721 = await ethers.getContractFactory("TestERC721");
      const TestERC20 = await ethers.getContractFactory("TestERC20");

      testERC721 = await TestERC721.deploy();
      await testERC721.deployed();

      testERC20 = await TestERC20.deploy();
      await testERC20.deployed();

      return await prepareForTesting(
        testERC721,
        testERC20,
        SwapType.ERC721_FOR_ERC20
      );
    }

    it("should successfully execute erc721 to erc20 swap if the buyer is specified", async () => {
      const {
        swapId,
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        expirationTime,
        swapArguments,
        signature,
      } = await loadFixture(prepareForTestingErc721ToErc20Swap);

      await testERC721
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20.connect(buyer).approve(swaptor.address, wantedTokenData);

      const expectedBuyerBalanceOfOfferedToken = (
        await testERC721.balanceOf(buyer.address)
      ).add(1);

      const swapTx = await swaptor
        .connect(buyer)
        .swapERC721ForERC20(swapArguments, signature, { value: FEE_IN_USD });

      expect((await testERC20.balanceOf(seller.address)).eq(wantedTokenData)).to
        .be.true;
      expect(
        (await testERC721.balanceOf(buyer.address)).eq(
          expectedBuyerBalanceOfOfferedToken
        )
      ).to.be.true;
      expect((await ethers.provider.getBalance(swaptor.address)).eq(FEE_IN_USD))
        .to.be.true;

      const swapIdHashed = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(swapId)
      );

      const {
        idSwapParticipants,
        sellerAddressSwapParticipants,
        buyerAddressSwapParticipants,
      } = await getSwapParticipantEventArgs(swapTx);

      const {
        idSwapDetails,
        offeredTokenAddressSwapDetails,
        wantedTokenAddressSwapDetails,
        offeredTokenDataSwapDetails,
        wantedTokenDataSwapDetails,
        expirationTimeSwapDetails,
      } = await getSwapDetailsEventArgsByHashedId(swapTx, swapIdHashed);

      expect(idSwapParticipants.hash).to.be.equal(idSwapDetails.hash);
      expect(idSwapParticipants.hash).to.be.equal(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(swapId))
      );

      expect(sellerAddressSwapParticipants).to.be.equal(seller.address);
      expect(buyerAddressSwapParticipants).to.be.equal(buyer.address);
      expect(offeredTokenAddressSwapDetails).to.be.equal(offeredTokenAddress);
      expect(wantedTokenAddressSwapDetails).to.be.equal(wantedTokenAddress);
      expect(offeredTokenDataSwapDetails).to.be.equal(offeredTokenData);
      expect(wantedTokenDataSwapDetails).to.be.equal(wantedTokenData);
      expect(expirationTimeSwapDetails).to.be.equal(expirationTime);
    });

    it("shouldn't successfully execute erc721 to erc20 swap if the specified buyer doesn't match the msg.sender", async () => {
      const {
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        swapId,
        swapType,
        chainId,
        expirationTime,
      } = await loadFixture(prepareForTestingErc721ToErc20Swap);

      const specifiedBuyerAddress = accounts[2].address;
      const swapArguments = encodeSwapArguments(
        swapId,
        swapType,
        seller.address,
        specifiedBuyerAddress,
        offeredTokenAddress,
        offeredTokenData,
        wantedTokenAddress,
        wantedTokenData,
        chainId,
        expirationTime
      );
      const signature = await getSwapSignature(seller, swapArguments);

      await testERC721
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20.connect(buyer).approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC721ForERC20(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "UnauthorizedBuyer");
    });

    it("should successfully execute erc721 to erc20 swap if the buyer isn't specified", async () => {
      const {
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        swapId,
        swapType,
        chainId,
        expirationTime,
      } = await loadFixture(prepareForTestingErc721ToErc20Swap);

      const swapArguments = encodeSwapArguments(
        swapId,
        swapType,
        seller.address,
        ethers.constants.AddressZero,
        offeredTokenAddress,
        offeredTokenData,
        wantedTokenAddress,
        wantedTokenData,
        chainId,
        expirationTime
      );
      const signature = await getSwapSignature(seller, swapArguments);

      await testERC721
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20.connect(buyer).approve(swaptor.address, wantedTokenData);

      const expectedBuyerBalanceOfOfferedToken = (
        await testERC721.balanceOf(buyer.address)
      ).add(1);

      await swaptor
        .connect(buyer)
        .swapERC721ForERC20(swapArguments, signature, { value: FEE_IN_USD });

      expect((await testERC20.balanceOf(seller.address)).eq(wantedTokenData)).to
        .be.true;
      expect(
        (await testERC721.balanceOf(buyer.address)).eq(
          expectedBuyerBalanceOfOfferedToken
        )
      ).to.be.true;
      expect((await ethers.provider.getBalance(swaptor.address)).eq(FEE_IN_USD))
        .to.be.true;
    });

    it("shouldn't successfully execute erc721 to erc20 swap if signature is invalid", async () => {
      const {
        seller,
        offeredTokenData,
        buyer,
        wantedTokenData,
        swapArguments,
      } = await loadFixture(prepareForTestingErc721ToErc20Swap);

      const fakeSigner = accounts[1];
      const signature = await getSwapSignature(fakeSigner, swapArguments);

      await testERC721
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20.connect(buyer).approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC721ForERC20(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "InvalidSignature");
    });

    it("shouldn't successfully execute erc721 to erc20 swap if offer has expired", async () => {
      const {
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        swapId,
        swapType,
        chainId,
      } = await loadFixture(prepareForTestingErc721ToErc20Swap);

      const expirationTime = (await time.latest()) - 1;
      const swapArguments = encodeSwapArguments(
        swapId,
        swapType,
        seller.address,
        buyer.address,
        offeredTokenAddress,
        offeredTokenData,
        wantedTokenAddress,
        wantedTokenData,
        chainId,
        expirationTime
      );
      const signature = await getSwapSignature(seller, swapArguments);

      await testERC721
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20.connect(buyer).approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC721ForERC20(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "SwapExpired");
    });

    it("shouldn't successfully execute erc721 to erc20 swap if chainId is invalid", async () => {
      const {
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        swapId,
        swapType,
        expirationTime,
      } = await loadFixture(prepareForTestingErc721ToErc20Swap);

      const chainId = "1";
      const swapArguments = encodeSwapArguments(
        swapId,
        swapType,
        seller.address,
        buyer.address,
        offeredTokenAddress,
        offeredTokenData,
        wantedTokenAddress,
        wantedTokenData,
        chainId,
        expirationTime
      );
      const signature = await getSwapSignature(seller, swapArguments);

      await testERC721
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20.connect(buyer).approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC721ForERC20(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "InvalidChainId");
    });

    it("shouldn't successfully execute erc721 to erc20 swap if signature has already been used", async () => {
      const {
        seller,
        offeredTokenData,
        buyer,
        wantedTokenData,
        swapArguments,
        signature,
      } = await loadFixture(prepareForTestingErc721ToErc20Swap);

      await testERC721
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20.connect(buyer).approve(swaptor.address, wantedTokenData);

      await swaptor
        .connect(buyer)
        .swapERC721ForERC20(swapArguments, signature, { value: FEE_IN_USD });

      await expect(
        swaptor
          .connect(buyer)
          .swapERC721ForERC20(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "SignatureUsed");
    });

    it("shouldn't execute erc721-erc20 swap if trial period has expired and msg.value is lower than FEE_IN_USD", async () => {
      const {
        seller,
        offeredTokenData,
        buyer,
        wantedTokenData,
        swapArguments,
        signature,
      } = await loadFixture(prepareForTestingErc721ToErc20Swap);

      await swaptor.setFreeTrialEndTime((await time.latest()) - 1);

      await testERC721
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20.connect(buyer).approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC721ForERC20(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "InsufficientFee");
    });

    it("should execute erc721-erc20 swap if trial period has expired and msg.value is valid", async () => {
      const {
        seller,
        offeredTokenData,
        buyer,
        wantedTokenData,
        swapArguments,
        signature,
      } = await loadFixture(prepareForTestingErc721ToErc20Swap);

      const feeInWei = getFeeInWei(FEE_IN_USD, chainlinkEthPrice);
      await swaptor.setFreeTrialEndTime((await time.latest()) - 1);

      await testERC721
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20.connect(buyer).approve(swaptor.address, wantedTokenData);

      await swaptor
        .connect(buyer)
        .swapERC721ForERC20(swapArguments, signature, {
          value: feeInWei,
        });

      expect((await ethers.provider.getBalance(swaptor.address)).eq(feeInWei))
        .to.be.true;
    });
  });

  describe("ERC721 to ERC721 swap tests", () => {
    let testERC721A: TestERC721;
    let testERC721B: TestERC721;

    async function prepareForTestingErc721ToErc721Swap() {
      const TestERC721 = await ethers.getContractFactory("TestERC721");

      testERC721A = await TestERC721.deploy();
      await testERC721A.deployed();

      testERC721B = await TestERC721.deploy();
      await testERC721B.deployed();

      return await prepareForTesting(
        testERC721A,
        testERC721B,
        SwapType.ERC721_FOR_ERC721
      );
    }

    it("should successfully execute erc721 to erc721 swap if the buyer is specified", async () => {
      const {
        swapId,
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        expirationTime,
        swapArguments,
        signature,
      } = await loadFixture(prepareForTestingErc721ToErc721Swap);

      await testERC721A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721B
        .connect(buyer)
        .approve(swaptor.address, wantedTokenData);

      const swapTx = await swaptor
        .connect(buyer)
        .swapERC721ForERC721(swapArguments, signature, { value: FEE_IN_USD });

      expect((await testERC721A.balanceOf(buyer.address)).eq(offeredTokenData))
        .to.be.true;
      expect((await testERC721B.balanceOf(seller.address)).eq(wantedTokenData))
        .to.be.true;
      expect((await ethers.provider.getBalance(swaptor.address)).eq(FEE_IN_USD))
        .to.be.true;

      const swapIdHashed = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(swapId)
      );

      const {
        idSwapParticipants,
        sellerAddressSwapParticipants,
        buyerAddressSwapParticipants,
      } = await getSwapParticipantEventArgs(swapTx);

      const {
        idSwapDetails,
        offeredTokenAddressSwapDetails,
        wantedTokenAddressSwapDetails,
        offeredTokenDataSwapDetails,
        wantedTokenDataSwapDetails,
        expirationTimeSwapDetails,
      } = await getSwapDetailsEventArgsByHashedId(swapTx, swapIdHashed);

      expect(idSwapParticipants.hash).to.be.equal(idSwapDetails.hash);
      expect(idSwapParticipants.hash).to.be.equal(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(swapId))
      );

      expect(sellerAddressSwapParticipants).to.be.equal(seller.address);
      expect(buyerAddressSwapParticipants).to.be.equal(buyer.address);
      expect(offeredTokenAddressSwapDetails).to.be.equal(offeredTokenAddress);
      expect(wantedTokenAddressSwapDetails).to.be.equal(wantedTokenAddress);
      expect(offeredTokenDataSwapDetails).to.be.equal(offeredTokenData);
      expect(wantedTokenDataSwapDetails).to.be.equal(wantedTokenData);
      expect(expirationTimeSwapDetails).to.be.equal(expirationTime);
    });

    it("shouldn't successfully execute erc721 to erc721 swap if the specified buyer doesn't match the msg.sender", async () => {
      const {
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        swapId,
        swapType,
        chainId,
        expirationTime,
      } = await loadFixture(prepareForTestingErc721ToErc721Swap);

      const specifiedBuyerAddress = accounts[2].address;
      const swapArguments = encodeSwapArguments(
        swapId,
        swapType,
        seller.address,
        specifiedBuyerAddress,
        offeredTokenAddress,
        offeredTokenData,
        wantedTokenAddress,
        wantedTokenData,
        chainId,
        expirationTime
      );
      const signature = await getSwapSignature(seller, swapArguments);

      await testERC721A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721B
        .connect(buyer)
        .approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC721ForERC721(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "UnauthorizedBuyer");
    });

    it("should successfully execute erc721 to erc721 swap if the buyer isn't specified", async () => {
      const {
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        swapId,
        swapType,
        chainId,
        expirationTime,
      } = await loadFixture(prepareForTestingErc721ToErc721Swap);

      const swapArguments = encodeSwapArguments(
        swapId,
        swapType,
        seller.address,
        ethers.constants.AddressZero,
        offeredTokenAddress,
        offeredTokenData,
        wantedTokenAddress,
        wantedTokenData,
        chainId,
        expirationTime
      );
      const signature = await getSwapSignature(seller, swapArguments);

      await testERC721A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721B
        .connect(buyer)
        .approve(swaptor.address, wantedTokenData);

      await swaptor
        .connect(buyer)
        .swapERC721ForERC721(swapArguments, signature, { value: FEE_IN_USD });

      expect((await testERC721A.balanceOf(buyer.address)).eq(offeredTokenData))
        .to.be.true;
      expect((await testERC721B.balanceOf(seller.address)).eq(wantedTokenData))
        .to.be.true;
      expect((await ethers.provider.getBalance(swaptor.address)).eq(FEE_IN_USD))
        .to.be.true;
    });

    it("shouldn't successfully execute erc721 to erc721 swap if signature is invalid", async () => {
      const {
        seller,
        offeredTokenData,
        buyer,
        wantedTokenData,
        swapArguments,
      } = await loadFixture(prepareForTestingErc721ToErc721Swap);

      const fakeSigner = accounts[1];
      const signature = await getSwapSignature(fakeSigner, swapArguments);

      await testERC721A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721B
        .connect(buyer)
        .approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC721ForERC721(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "InvalidSignature");
    });

    it("shouldn't successfully execute erc721 to erc721 swap if offer has expired", async () => {
      const {
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        swapId,
        swapType,
        chainId,
      } = await loadFixture(prepareForTestingErc721ToErc721Swap);

      const expirationTime = (await time.latest()) - 1;
      const swapArguments = encodeSwapArguments(
        swapId,
        swapType,
        seller.address,
        buyer.address,
        offeredTokenAddress,
        offeredTokenData,
        wantedTokenAddress,
        wantedTokenData,
        chainId,
        expirationTime
      );
      const signature = await getSwapSignature(seller, swapArguments);

      await testERC721A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721B
        .connect(buyer)
        .approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC721ForERC721(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "SwapExpired");
    });

    it("shouldn't successfully execute erc721 to erc721 swap if chainId is invalid", async () => {
      const {
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        swapId,
        swapType,
        expirationTime,
      } = await loadFixture(prepareForTestingErc721ToErc721Swap);

      const chainId = "1";
      const swapArguments = encodeSwapArguments(
        swapId,
        swapType,
        seller.address,
        buyer.address,
        offeredTokenAddress,
        offeredTokenData,
        wantedTokenAddress,
        wantedTokenData,
        chainId,
        expirationTime
      );
      const signature = await getSwapSignature(seller, swapArguments);

      await testERC721A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721B
        .connect(buyer)
        .approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC721ForERC721(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "InvalidChainId");
    });

    it("shouldn't successfully execute erc721 to erc721 swap if signature has already been used", async () => {
      const {
        seller,
        offeredTokenData,
        buyer,
        wantedTokenData,
        swapArguments,
        signature,
      } = await loadFixture(prepareForTestingErc721ToErc721Swap);

      await testERC721A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721B
        .connect(buyer)
        .approve(swaptor.address, wantedTokenData);

      await swaptor
        .connect(buyer)
        .swapERC721ForERC721(swapArguments, signature, { value: FEE_IN_USD });

      await expect(
        swaptor
          .connect(buyer)
          .swapERC721ForERC721(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "SignatureUsed");
    });

    it("shouldn't execute erc721-erc721 swap if trial period has expired and msg.value is lower than FEE_IN_USD", async () => {
      const {
        seller,
        offeredTokenData,
        buyer,
        wantedTokenData,
        swapArguments,
        signature,
      } = await loadFixture(prepareForTestingErc721ToErc721Swap);

      await swaptor.setFreeTrialEndTime((await time.latest()) - 1);

      await testERC721A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721B
        .connect(buyer)
        .approve(swaptor.address, wantedTokenData);

      await expect(
        swaptor
          .connect(buyer)
          .swapERC721ForERC721(swapArguments, signature, { value: FEE_IN_USD })
      ).to.be.revertedWithCustomError(swaptor, "InsufficientFee");
    });

    it("should execute erc721-erc721 swap if trial period has expired and msg.value is valid", async () => {
      const {
        seller,
        offeredTokenData,
        buyer,
        wantedTokenData,
        swapArguments,
        signature,
      } = await loadFixture(prepareForTestingErc721ToErc721Swap);

      await swaptor.setFreeTrialEndTime((await time.latest()) - 1);
      const feeInWei = getFeeInWei(FEE_IN_USD, chainlinkEthPrice);

      await testERC721A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC721B
        .connect(buyer)
        .approve(swaptor.address, wantedTokenData);

      await swaptor
        .connect(buyer)
        .swapERC721ForERC721(swapArguments, signature, {
          value: feeInWei,
        });

      expect((await ethers.provider.getBalance(swaptor.address)).eq(feeInWei))
        .to.be.true;
    });
  });

  describe("Validation tests", () => {
    let testERC20A: TestERC20;
    let testERC20B: TestERC20;

    async function prepareForTestingErc20ToErc20Swap() {
      const TestERC20 = await ethers.getContractFactory("TestERC20");

      testERC20A = await TestERC20.deploy();
      await testERC20A.deployed();

      testERC20B = await TestERC20.deploy();
      await testERC20B.deployed();

      return await prepareForTesting(
        testERC20A,
        testERC20B,
        SwapType.ERC20_FOR_ERC20
      );
    }

    it("should successfully cancel the swap", async () => {
      const { seller, swapArguments, signature } = await loadFixture(
        prepareForTestingErc20ToErc20Swap
      );

      await swaptor.connect(seller).cancelSwap(swapArguments, signature);

      expect(await swaptor.signatureUsed(signature)).to.be.true;
    });

    it("shouldn't cancel the swap if the caller is not the seller", async () => {
      const { buyer, swapArguments, signature } = await loadFixture(
        prepareForTestingErc20ToErc20Swap
      );

      await expect(
        swaptor.connect(buyer).cancelSwap(swapArguments, signature)
      ).to.be.revertedWithCustomError(swaptor, "Unauthorized");
    });

    it("shouldn't cancel the swap if signature is compromised", async () => {
      const { seller, swapArguments } = await loadFixture(
        prepareForTestingErc20ToErc20Swap
      );

      const fakeSigner = accounts[3];
      const signature = await getSwapSignature(fakeSigner, swapArguments);

      await expect(
        swaptor.connect(seller).cancelSwap(swapArguments, signature)
      ).to.be.revertedWithCustomError(swaptor, "InvalidSignature");
    });

    it("should successfully withdraw funds from the contract", async () => {
      const feeRecipient = accounts[3];
      const feeRecipientBalance = await ethers.provider.getBalance(
        feeRecipient.address
      );
      const feeInWei = getFeeInWei(FEE_IN_USD, chainlinkEthPrice);

      const {
        seller,
        offeredTokenAddress,
        offeredTokenData,
        buyer,
        wantedTokenAddress,
        wantedTokenData,
        swapId,
        swapType,
        chainId,
        expirationTime,
      } = await loadFixture(prepareForTestingErc20ToErc20Swap);

      const swapArguments = encodeSwapArguments(
        swapId,
        swapType,
        seller.address,
        ethers.constants.AddressZero,
        offeredTokenAddress,
        offeredTokenData,
        wantedTokenAddress,
        wantedTokenData,
        chainId,
        expirationTime
      );
      const signature = await getSwapSignature(seller, swapArguments);

      await testERC20A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20B.connect(buyer).approve(swaptor.address, wantedTokenData);

      await swaptor
        .connect(buyer)
        .swapERC20ForERC20(swapArguments, signature, { value: feeInWei });

      await swaptor.withdraw(feeInWei, feeRecipient.address);

      expect(
        feeRecipientBalance.eq(
          (await ethers.provider.getBalance(feeRecipient.address)).sub(feeInWei)
        )
      ).to.be.true;
    });

    it("shouldn't withdraw funds from the contract if the caller is not the owner", async () => {
      const feeRecipient = accounts[3];
      const feeInWei = getFeeInWei(FEE_IN_USD, chainlinkEthPrice);

      const {
        seller,
        offeredTokenData,
        buyer,
        wantedTokenData,
        swapArguments,
        signature,
      } = await loadFixture(prepareForTestingErc20ToErc20Swap);

      await testERC20A
        .connect(seller)
        .approve(swaptor.address, offeredTokenData);

      await testERC20B.connect(buyer).approve(swaptor.address, wantedTokenData);

      await swaptor
        .connect(buyer)
        .swapERC20ForERC20(swapArguments, signature, { value: feeInWei });

      await expect(
        swaptor.connect(accounts[0]).withdraw(feeInWei, feeRecipient.address)
      ).to.be.reverted;
    });

    it("should successfully set new fee", async () => {
      const newFee = (+FEE_IN_USD * 2).toString();

      await swaptor.connect(deployer).setFeeInUsd(newFee);

      expect(await swaptor.feeInUsd()).to.be.equal(newFee);
    });

    it("shouldn't set new fee if the caller is not the owner", async () => {
      const newFee = (+FEE_IN_USD * 2).toString();

      await expect(swaptor.connect(accounts[0]).setFeeInUsd(newFee)).to.be
        .reverted;
    });

    it("should successfully set new free trial end time", async () => {
      const newFreeTrialEndTime = await time.latest();

      await swaptor.connect(deployer).setFreeTrialEndTime(newFreeTrialEndTime);

      expect(await swaptor.freeTrialEndTime()).to.be.equal(newFreeTrialEndTime);
    });

    it("shouldn't set new free trial end time if the caller is not the owner", async () => {
      const newFreeTrialEndTime = await time.latest();

      await expect(
        swaptor.connect(accounts[0]).setFreeTrialEndTime(newFreeTrialEndTime)
      ).to.be.reverted;
    });

    it("should successfully set new Chainlink price feed", async () => {
      const newPriceFeed = ethers.Wallet.createRandom().address;

      await swaptor.connect(deployer).setPriceFeed(newPriceFeed);

      expect(await swaptor.priceFeed()).to.be.equal(newPriceFeed);
    });

    it("shouldn't set new Chainlink price feed if the caller is not the owner", async () => {
      const newPriceFeed = ethers.Wallet.createRandom().address;

      await expect(swaptor.connect(accounts[0]).setPriceFeed(newPriceFeed)).to
        .be.reverted;
    });
  });
});
