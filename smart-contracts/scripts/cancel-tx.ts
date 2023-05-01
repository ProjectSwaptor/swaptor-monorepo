import { ethers } from "hardhat";

const main = async () => {
  const [deployer] = await ethers.getSigners();

  const nonce = await deployer.getTransactionCount();

  const tx = {
    nonce,
    to: ethers.constants.AddressZero,
    data: "0x",
    gasPrice: ethers.utils.parseUnits("100", "gwei"),
  };

  await (await deployer.sendTransaction(tx)).wait();
  console.log("Cancelled");
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});