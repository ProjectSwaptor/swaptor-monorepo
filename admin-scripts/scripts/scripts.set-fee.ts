import { ethers } from "ethers";

import { SwaptorConfigModel } from "../../backend/src/swaps/swaps.models";
import { SwaptorProperty } from "../../backend/src/swaps/swaps.constants";
import { FEE_DECIMALS } from "../constants/constants.swaptor";

const SwaptorDeployments = [
  { chainId: "81000", address: "0xf54c99af22a99174bfc6383a0170edccf1a46fde" },
];

const setFee = async (fee: string) => {
  const parsedFee = ethers.parseUnits(fee, FEE_DECIMALS);

  await SwaptorConfigModel.updateOne(
    { property: SwaptorProperty.Fee },
    { value: parsedFee }
  );
  
};
