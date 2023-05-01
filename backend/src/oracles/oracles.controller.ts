import { Response } from "express";

import * as service from "./oracles.service";
import {
  GetBlocktimesRequest,
  GetNativeCurrencyPriceRequest,
} from "./oracles.schema";

export const getNativeCurrencyPrice = async (
  req: GetNativeCurrencyPriceRequest,
  res: Response
) => {
  const { chain } = req.params;
  const price = await service.getNativeCurrencyPrice(chain);

  return res.send(price);
};

export const getBlockchainTime = async (
  req: GetBlocktimesRequest,
  res: Response
) => {
  const { chain } = req.params;
  const blockchainTime = await service.getBlockchainTime(chain);

  return res.send(blockchainTime);
};
