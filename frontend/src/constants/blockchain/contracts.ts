import { ethers } from "ethers";

import { SWAPTOR_ABI } from "./abis";
import { SWAPTOR_ADDRESS } from "@/environment";

export const SWAPTOR_CONTRACT = new ethers.Contract(
  SWAPTOR_ADDRESS!,
  SWAPTOR_ABI
);
