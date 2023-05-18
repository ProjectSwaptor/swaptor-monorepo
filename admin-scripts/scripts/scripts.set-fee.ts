import { ethers } from "ethers";
import { mongoose } from "@typegoose/typegoose";

import * as SwaptorJSON from "../../backend/src/abis/Swaptor.json";

import { SwaptorConfigModel } from "../../backend/src/swaps/swaps.models";
import { SwaptorProperty } from "../../backend/src/swaps/swaps.constants";
import { FEE_DECIMALS } from "../constants/constants.swaptor";
import { MessageLogger, tryCatchFail } from "../helpers/helpers.utils";
import { DB_CONNECTION_STRING, SWAPTOR_PRIVATE_KEY } from "../environment";
import {
  CHAIN_TO_RPC,
  Chain,
  SWAPTOR_ADDRESSES,
} from "../../backend/src/common/common.constants";

const updateSwaptorFeeDb = async (fee: string) => {
  const logger = new MessageLogger({
    startMessage: "Updating Swaptor Fee in DB",
    successMessage: "Updated Swaptor fee in DB",
    errorMessage: "Error updating Swaptor fee in DB",
  });

  const handler = async () =>
    await SwaptorConfigModel.updateOne(
      { property: SwaptorProperty.Fee },
      { value: fee }
    );

  await tryCatchFail(handler, logger);
};

const updateSwaptorFeeContract = async (fee: string) => {
  const feeSetters = Object.entries(SWAPTOR_ADDRESSES).map(
    ([chain, address]) => {
      const provider = new ethers.JsonRpcProvider(CHAIN_TO_RPC[chain as Chain]);
      const signer = new ethers.Wallet(SWAPTOR_PRIVATE_KEY, provider);
      const swaptor = new ethers.Contract(address, SwaptorJSON.abi, signer);

      const logger = new MessageLogger({
        startMessage: `Setting fee for Swaptor on ${chain}`,
        successMessage: `Successfully set fee for Swaptor on ${chain}`,
        errorMessage: `Error updating Swaptor fee on ${chain}`,
      });

      const handler = async () => await swaptor.setFeeInUsd(fee);

      return tryCatchFail(handler, logger);
    }
  );

  await Promise.all(feeSetters);
};

const main = async () => {
  await mongoose.connect(DB_CONNECTION_STRING);

  const args = process.argv[2];

  if (args.length !== 3) {
    throw new Error("Missing argument for fee or too many arguments given");
  }

  const fee = ethers.parseUnits(args[0], FEE_DECIMALS).toString();

  await updateSwaptorFeeDb(fee);
  await updateSwaptorFeeContract(fee);
};

main();
