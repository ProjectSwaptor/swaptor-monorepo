import { ethers } from "ethers";
import { mongoose } from "@typegoose/typegoose";

import * as SwaptorJSON from "../../backend/src/abis/Swaptor.json";

import { SwaptorConfigModel } from "../../backend/src/swaps/swaps.models";
import { SwaptorProperty } from "../../backend/src/swaps/swaps.constants";
import { FEE_DECIMALS } from "../constants/constants.swaptor";
import {
  CHAIN_TO_RPC,
  Chain,
  SWAPTOR_ADDRESSES,
} from "../../backend/src/common/common.constants";
import { MessageLogger, tryCatchFail } from "../helpers/helpers.utils";
import { DB_CONNECTION_STRING, SWAPTOR_PRIVATE_KEY } from "../environment";

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
  for (const [chain, address] of Object.entries(SWAPTOR_ADDRESSES)) {
    const provider = new ethers.JsonRpcProvider(CHAIN_TO_RPC[chain as Chain]);
    const signer = new ethers.Wallet(SWAPTOR_PRIVATE_KEY, provider);
    const swaptor = new ethers.Contract(address, SwaptorJSON.abi, signer);

    const logger = new MessageLogger({
      startMessage: `Setting fee for Swaptor on ${chain}`,
      successMessage: `Successfully set fee for Swaptor on ${chain}`,
      errorMessage: `Error updating Swaptor fee on ${chain}`,
    });

    const handler = async () => await swaptor.setFeeInUsd(fee);

    await tryCatchFail(handler, logger);
  }
};

const setFee = async (fee: string) => {
  await updateSwaptorFeeDb(fee);
  await updateSwaptorFeeContract(fee);
};

const main = async () => {
  await mongoose.connect(DB_CONNECTION_STRING);

  const args = process.argv[2];

  if (!args || args.length === 0) {
    throw new Error("Missing argument for fee");
  }

  const fee = ethers.parseUnits(args[0], FEE_DECIMALS).toString();
  await setFee(fee);
};

main();
