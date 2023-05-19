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
  const fee = process.env.npm_config_fee;
  const dbOnly = process.env.npm_config_db_only;
  const contractsOnly = process.env.npm_config_contracts_only;

  if (!fee) {
    throw new Error("Fee not specified");
  }

  if (dbOnly && contractsOnly) {
    throw new Error("Cannot specify both db-only and contracts-only");
  }

  const parsedFee = ethers.parseUnits(fee, FEE_DECIMALS).toString();
  await mongoose.connect(DB_CONNECTION_STRING);

  if (dbOnly) {
    await updateSwaptorFeeDb(parsedFee);
    return;
  }

  if (contractsOnly) {
    await updateSwaptorFeeContract(parsedFee);
    return;
  }

  await updateSwaptorFeeDb(parsedFee);
  await updateSwaptorFeeContract(parsedFee);
};

main();
