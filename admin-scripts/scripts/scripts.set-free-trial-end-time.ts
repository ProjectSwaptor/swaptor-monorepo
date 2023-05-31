import { ethers } from "ethers";
import { getModelForClass, mongoose } from "@typegoose/typegoose";

import * as SwaptorJSON from "../../backend/src/abis/Swaptor.json";

import { SwaptorConfig } from "../../backend/src/swaps/swaps.models";
import { SwaptorProperty } from "../../backend/src/swaps/swaps.constants";
import { MessageLogger, tryCatchFail } from "../helpers/helpers.utils";
import { DB_CONNECTION_STRING, SWAPTOR_PRIVATE_KEY } from "../environment";
import {
  CHAIN_TO_RPC,
  Chain,
  SWAPTOR_ADDRESSES,
} from "../../backend/src/common/common.constants";
import { ExitCode } from "../constants/constants.swaptor";

const updateSwaptorFreeTrialEndTimeDb = async (freeTrialEndTime: string) => {
  const logger = new MessageLogger({
    startMessage: "Updating Swaptor free trial end time in DB",
    successMessage: "Updated Swaptor free trial end time in DB",
    errorMessage: "Error updating Swaptor free trial end time in DB",
  });

  const model = getModelForClass(SwaptorConfig);

  const handler = async () =>
    await model.updateOne(
      { property: SwaptorProperty.FreeTrialEndTime },
      { property: SwaptorProperty.FreeTrialEndTime, value: freeTrialEndTime },
      { upsert: true }
    );

  await tryCatchFail(handler, logger);
};

const updateSwaptorFreeTrialEndTimeContract = async (
  freeTrialEndTime: string
) => {
  const freeTrialEndTimeSetters = Object.entries(SWAPTOR_ADDRESSES).map(
    ([chain, address]) => {
      const provider = new ethers.providers.JsonRpcProvider(
        CHAIN_TO_RPC[chain as Chain]
      );
      const signer = new ethers.Wallet(SWAPTOR_PRIVATE_KEY, provider);
      const swaptor = new ethers.Contract(address, SwaptorJSON.abi, signer);

      const logger = new MessageLogger({
        startMessage: `Setting free trial end time for Swaptor on ${chain}`,
        successMessage: `Successfully set free trial end time for Swaptor on ${chain}`,
        errorMessage: `Error updating Swaptor free trial end time on ${chain}`,
      });

      const handler = async () =>
        await swaptor.setFreeTrialEndTime(freeTrialEndTime);

      return tryCatchFail(handler, logger);
    }
  );

  await Promise.all(freeTrialEndTimeSetters);
};

const main = async () => {
  const freeTrialEndTime = process.env.npm_config_free_trial_end_time;
  const dbOnly = process.env.npm_config_db_only;
  const contractsOnly = process.env.npm_config_contracts_only;

  if (!freeTrialEndTime) {
    throw new Error("Free trial end time not specified");
  }

  if (dbOnly && contractsOnly) {
    throw new Error("Cannot specify both db-only and contracts-only");
  }

  await mongoose.connect(DB_CONNECTION_STRING);

  if (dbOnly) {
    await updateSwaptorFreeTrialEndTimeDb(freeTrialEndTime);
    return;
  }

  if (contractsOnly) {
    await updateSwaptorFreeTrialEndTimeContract(freeTrialEndTime);
    return;
  }

  await updateSwaptorFreeTrialEndTimeDb(freeTrialEndTime);
  await updateSwaptorFreeTrialEndTimeContract(freeTrialEndTime);
};

main().then(() => process.exit(ExitCode.SUCCESS));
