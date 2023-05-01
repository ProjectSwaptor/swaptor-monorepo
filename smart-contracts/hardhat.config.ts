import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";

dotenv.config();

const config: HardhatUserConfig = {
  gasReporter: {
    enabled: process.env.GAS_REPORTER ? true : false,
    currency: "USD",
    gasPrice: 21,
    coinmarketcap: process.env.COINMARKETCAP_KEY,
  },
  solidity: {
    version: "0.8.16",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    mumbai: {
      url: "https://matic-mumbai.chainstacklabs.com",
      chainId: 80001,
      accounts:
        process.env.PRIVATE_KEY_MUMBAI !== undefined
          ? [process.env.PRIVATE_KEY_MUMBAI]
          : [],
    },
  },
  etherscan: { apiKey: process.env.POLYGONSCAN_API_KEY },
};

export default config;
