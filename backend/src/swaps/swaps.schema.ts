import { z } from "zod";
import { isAddress } from "ethers/lib/utils";
import {
  isChainIdSupported,
  isPositiveInteger,
  isPositiveNumberString,
  isTransactionHash,
  isSwapId,
} from "../common/common.predicates";

import {
  Chain,
  SIGNATURE_LENGTH,
  SWAPTOR_ADDRESSES,
} from "../common/common.constants";
import { SwaptorChains, TypedRequest } from "../common/common.types";
import { SwapType } from "./swaps.constants";

const createSwapBody = z
  .object({
    signature: z
      .string()
      .refine(
        (signature) =>
          signature.length === SIGNATURE_LENGTH &&
          signature.substring(0, 2) === "0x",
        { message: "invalid signature format" }
      ),
    id: z.string().refine((id) => isSwapId(id), { message: "id isn't valid" }),
    swapType: z.nativeEnum(SwapType),
    seller: z.string().refine((address) => isAddress(address), {
      message: "invalid seller address format",
    }),
    buyer: z.string().refine((address) => isAddress(address), {
      message: "invalid buyer address format",
    }),
    offeredTokenAddress: z.string().refine((address) => isAddress(address), {
      message: "invalid offered token address format",
    }),
    offeredTokenData: z.string().refine((data) => isPositiveNumberString(data)),
    wantedTokenAddress: z.string().refine((address) => isAddress(address), {
      message: "invalid wanted token address format",
    }),
    wantedTokenData: z.string().refine((data) => isPositiveNumberString(data)),
    chainId: z
      .string()
      .refine(
        (data) => isPositiveNumberString(data) && isChainIdSupported(data)
      ),
    expirationTime: z.string().refine((data) => isPositiveNumberString(data)),
  })
  .strict({ message: "disallowed keys in object" });

const getSwapParams = z.object({
  id: z.string().refine((data) => isSwapId(data), { message: "invalid id" }),
});

const getSwapQuery = z.object({
  seller: z
    .string()
    .optional()
    .refine(
      (address) => {
        if (!address) {
          return true;
        }

        return isAddress(address);
      },
      {
        message: "invalid address format",
      }
    ),
  buyer: z
    .string()
    .optional()
    .refine(
      (address) => {
        if (!address) {
          return true;
        }

        return isAddress(address);
      },
      {
        message: "invalid address format",
      }
    ),
  limit: z
    .any()
    .optional()
    .refine((l) => {
      if (!l) {
        return true;
      }

      return isPositiveInteger(l);
    })
    .transform((l) => {
      if (l) {
        return parseInt(l);
      }
    }),
});

const updateSwapStateBody = z.object({
  transactionHash: z
    .string()
    .refine((hash) => isTransactionHash(hash), "invalid transaction hash"),
});

export type SwapQuery = typeof getSwapQuery._type;

export const createSwapSchema = {
  body: createSwapBody,
};

export const getSwapSchema = {
  params: getSwapParams,
};

export const updateSwapStateSchema = {
  params: getSwapParams,
  body: updateSwapStateBody,
};

export const getSwapsSchema = {
  query: getSwapQuery,
};

export type CreateSwapRequest = TypedRequest<typeof createSwapSchema>;

export type GetSwapRequest = TypedRequest<typeof getSwapSchema>;

export type GetSwapsRequest = TypedRequest<typeof getSwapsSchema>;

export type UpdateSwapStateRequest = TypedRequest<typeof updateSwapStateSchema>;
