import { ethers } from "ethers";

import * as SwaptorJSON from "../../backend/src/abis/Swaptor.json";

import { SwaptorConfigModel } from "../../backend/src/swaps/swaps.models";
import { SwaptorProperty } from "../../backend/src/swaps/swaps.constants";
import { FEE_DECIMALS } from "../constants/constants.swaptor";
import { SWAPTOR_ADDRESSES } from "../../backend/src/common/common.constants";
import { MessageLogger, tryCatchFail } from "../helpers/helpers.utils";

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
    const swaptor = new ethers.Contract(address, SwaptorJSON.abi);

    const logger = new MessageLogger({
      startMessage: `Setting fee for Swaptor on ${chain}`,
      successMessage: `Successfully set fee for Swaptor on ${chain}`,
      errorMessage: `Error updating Swaptor fee in on ${chain}`,
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
  const args = process.argv[2];

  if (!args || args.length === 0) {
    throw new Error("Missing argument for fee");
  }

  const fee = ethers.parseUnits(args[0], FEE_DECIMALS).toString();
  await setFee(fee);
};

main();
