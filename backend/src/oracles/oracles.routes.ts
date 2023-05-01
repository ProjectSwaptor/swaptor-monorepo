import { Router } from "express";
import { processRequest } from "zod-express-middleware";

import {
  getBlockchainTime,
  getNativeCurrencyPrice,
} from "./oracles.controller";
import {
  getBlocktimesSchema,
  getNativeCurrencyPriceSchema,
} from "./oracles.schema";

const router = Router();

router.get(
  "/chains/:chain/price",
  processRequest(getNativeCurrencyPriceSchema),
  getNativeCurrencyPrice
);

router.get(
  "/chains/:chain/time",
  processRequest(getBlocktimesSchema),
  getBlockchainTime
);

export default router;
