import { StatusCodes } from "http-status-codes";
import { solidityKeccak256 } from "ethers/lib/utils";

import { Swap, SwapModel, SwaptorConfigModel } from "./swaps.models";
import { CreateSwapDto } from "./dtos/swaps.dtos";
import { SwapQuery } from "./swaps.schema";
import { getSwaptorEventParams, transformChainToHex } from "./swaps.utils";
import { HttpError } from "../errors/errors.classes";
import { MAX_RESOURCE_LIMIT } from "../environment";
import { SwaptorChains } from "../common/common.types";
import { SwaptorEvent, SwaptorProperty } from "./swaps.constants";

export const createSwap = async (createSwapDto: CreateSwapDto) => {
  const { id } = await SwapModel.create(createSwapDto);

  return id;
};

export const getSwap = async (swapId: string) => {
  const swap = await SwapModel.findOne({ id: swapId }).select(["-__v", "-_id"]);

  if (!swap) {
    throw new HttpError("Swap not found", StatusCodes.NOT_FOUND);
  }

  return swap;
};

export const getSwaps = async (swapQuery: SwapQuery) => {
  const { limit, ...query } = swapQuery;

  return await SwapModel.find(query)
    .limit(limit ? Math.min(limit, MAX_RESOURCE_LIMIT) : MAX_RESOURCE_LIMIT)
    .select(["-__v", "-_id"])
    .sort({ createdAt: "desc" });
};

export const updateSwapState = async (swap: Swap, transactionHash: string) => {
  const { chainId, active, id } = swap;

  const chainIdHex = transformChainToHex(chainId) as SwaptorChains;

  if (!active) {
    throw new HttpError("Swap isn't active", StatusCodes.BAD_REQUEST);
  }

  const swapEvent = await getSwaptorEventParams(
    SwaptorEvent.SwapParticipants,
    transactionHash,
    chainIdHex
  );

  if (!swapEvent) {
    throw new HttpError("Invalid swap event", StatusCodes.BAD_REQUEST);
  }

  if (swapEvent[0].hash !== solidityKeccak256(["string"], [id])) {
    throw new HttpError("Provided swap id and swap id from event mismatch");
  }

  return await SwapModel.updateOne({ id }, { active: false });
};

export const getFeeInUsd = async () => {
  const fee = await SwaptorConfigModel.findOne({
    property: SwaptorProperty.Fee,
  });

  if (!fee) {
    throw new HttpError("Fee not found", StatusCodes.NOT_FOUND);
  }

  return { feeInUsd: fee.value };
};

export const getFreeTrialEndTime = async () => {
  const freeTrialEndTime = await SwaptorConfigModel.findOne({
    property: SwaptorProperty.FreeTrialEndTime,
  });

  if (!freeTrialEndTime) {
    throw new HttpError("Free trial end time not found", StatusCodes.NOT_FOUND);
  }

  return { freeTrialEndTime: freeTrialEndTime.value };
};
