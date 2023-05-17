import { ethers } from "ethers";

import * as SwaptorJSON from "../../backend/src/abis/Swaptor.json";

import { SwaptorConfigModel } from "../../backend/src/swaps/swaps.models";
import { SwaptorProperty } from "../../backend/src/swaps/swaps.constants";
import { FEE_DECIMALS } from "../constants/constants.swaptor";
import { SWAPTOR_ADDRESSES } from "../../backend/src/common/common.constants";

const EXIT_CODE_FAIL = 1;

type InfoMessages = {
  startMessage?: string;
  successMessage?: string;
  errorMessage?: string;
};

const tryCatchFail = async <G>(
  handler: () => Promise<G>,
  messages: InfoMessages
) => {
  try {
    messages.startMessage && console.log(messages.startMessage);
    await handler();
    messages.successMessage && console.log(messages.successMessage);
  } catch (e) {
    messages.errorMessage && console.log(messages.errorMessage);

    if (e instanceof Error) {
      console.log("Message: ", e.message);
    }

    process.exit(EXIT_CODE_FAIL);
  }
};

const updateSwaptorFeeDb = async (fee: string) => {
  await tryCatchFail(
    async () =>
      await SwaptorConfigModel.updateOne(
        { property: SwaptorProperty.Fee },
        { value: fee }
      ),
    {
      startMessage: "Updating Swaptor Fee in DB",
      successMessage: "Updated Swaptor fee in DB",
      errorMessage: "Error updating Swaptor fee in DB",
    }
  );
};

const updateSwaptorFeeContract = async (fee: string) => {
  for (const [chain, address] of Object.entries(SWAPTOR_ADDRESSES)) {
    const swaptor = new ethers.Contract(address, SwaptorJSON.abi);

    await tryCatchFail(async () => await swaptor.setFeeInUsd(fee), {
      startMessage: `Setting fee for Swaptor on ${chain}`,
      successMessage: `Succesfully set fee for Swaptor on ${chain}`,
      errorMessage: `Error updating Swaptor fee in on ${chain}`,
    });
  }
};

const setFee = async (fee: string) => {
  const parsedFee = ethers.parseUnits(fee, FEE_DECIMALS).toString();

  await updateSwaptorFeeDb(parsedFee);
  await updateSwaptorFeeContract(parsedFee);
};
