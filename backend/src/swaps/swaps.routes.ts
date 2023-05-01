import { Router } from "express";
import { processRequest } from "zod-express-middleware";

import {
  createSwap,
  getSwap,
  getSwaps,
  updateSwapState,
  getFeeInUsd,
} from "./swaps.controller";
import { validateSignature } from "./swaps.middlewares";
import {
  createSwapSchema,
  getFeeSchema,
  getSwapSchema,
  getSwapsSchema,
  updateSwapStateSchema,
} from "./swaps.schema";

const router = Router();

router.post(
  "/swaps",
  processRequest(createSwapSchema),
  validateSignature,
  createSwap
);

router.get("/swaps", processRequest(getSwapsSchema), getSwaps);

router.get("/swaps/:id", processRequest(getSwapSchema), getSwap);

router.get("/swaps/:chain/fee", processRequest(getFeeSchema), getFeeInUsd);

router.patch(
  "/swaps/:id/update-state",
  processRequest(updateSwapStateSchema),
  updateSwapState
);

export default router;
