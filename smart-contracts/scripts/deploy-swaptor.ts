import { ethers } from "hardhat";
import hre from "hardhat";

import { Swaptor } from "../typechain-types";
import { deployUpgradeableContract, getNetworkPriceFeed } from "../utils/utils";
import { FEE_IN_USD, FEE_TRIAL_DURATION } from "../utils/constants";

const main = async () => {
  let swaptor: Swaptor;

  const [deployer] = await ethers.getSigners();

  const latestBlockNumber = await ethers.provider.getBlockNumber();
  const latestBlock = await ethers.provider.getBlock(latestBlockNumber);
  const latestTimestamp = latestBlock.timestamp;

  const priceFeed = getNetworkPriceFeed(hre.network.name);

  console.log("\nDeployer address: ", deployer.address);
  console.log(
    "Account balance before deployment: ",
    (await deployer.getBalance()).toString()
  );

  swaptor = await deployUpgradeableContract<Swaptor>("Swaptor", [
    FEE_IN_USD,
    latestTimestamp + FEE_TRIAL_DURATION,
    priceFeed,
  ]);

  console.log("\nSwaptor deployed at: " + swaptor.address);
  console.log(
    "Account balance after deployment: ",
    (await deployer.getBalance()).toString()
  );
  console.log("\n Add Swaptor address to your .env file!");
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
