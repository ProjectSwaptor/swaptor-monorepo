import { Response, Request } from "express";
import { StatusCodes } from "http-status-codes";

import * as service from "./swaps.service";
import {
  CreateSwapRequest,
  GetSwapRequest,
  GetSwapsRequest,
  UpdateSwapStateRequest,
} from "./swaps.schema";

export const createSwap = async (req: CreateSwapRequest, res: Response) => {
  const id = await service.createSwap(req.body);

  return res.status(StatusCodes.CREATED).json({ id });
};

export const getSwap = async (req: GetSwapRequest, res: Response) => {
  const swap = await service.getSwap(req.params.id);

  return res.json(swap);
};

export const getSwaps = async (req: GetSwapsRequest, res: Response) => {
  const swaps = await service.getSwaps(req.query);

  return res.status(StatusCodes.OK).send(swaps);
};

export const updateSwapState = async (
  req: UpdateSwapStateRequest,
  res: Response
) => {
  const { id } = req.params;
  const { transactionHash } = req.body;

  const swap = await service.getSwap(id);
  await service.updateSwapState(swap, transactionHash);

  return res.status(StatusCodes.OK).json({ id, active: false });
};

export const getFeeInUsd = async (req: Request, res: Response) => {
  const fee = await service.getFeeInUsd();

  return res.json(fee);
};
