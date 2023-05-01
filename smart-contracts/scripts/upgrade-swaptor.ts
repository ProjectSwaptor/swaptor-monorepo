import * as dotenv from "dotenv";
import { ethers, upgrades } from "hardhat";

dotenv.config();

const main = async () => {
  const [deployer] = await ethers.getSigners();

  console.log("Owner address: ", deployer.address);
  console.log("Swaptor address: ", process.env.SWAPTOR_ADDRESS!);
  console.log(
    "Account balance before upgrade: ",
    (await deployer.getBalance()).toString()
  );

  try {
    const Factory = await ethers.getContractFactory("Swaptor");
    const swaptorAddress = (
      await upgrades.upgradeProxy(process.env.SWAPTOR_ADDRESS!, Factory)
    ).address;

    console.log(
      "Account balance after deployment: ",
      (await deployer.getBalance()).toString()
    );
    console.log(
      "Changed implementation contract of Swaptor proxy at address: " +
        swaptorAddress
    );
  } catch (e) {
    console.log(e);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
