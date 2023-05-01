import { z } from "zod";

import { TypedRequest } from "../common/common.types";
import { Chain } from "../common/common.constants";

const getBlocktimesParams = z.object({
  chain: z
    .string()
    .refine((chain) =>
      Object.values(Chain).includes(chain.toLowerCase() as Chain)
    )
    .transform((chain) => chain.toLowerCase() as Chain),
});

const getNativeCurrencyPriceParams = z.object({
  chain: z
    .string()
    .refine((chain) =>
      Object.values(Chain).includes(chain.toLowerCase() as Chain)
    )
    .transform((chain) => chain.toLowerCase() as Chain),
});

export const getBlocktimesSchema = {
  params: getBlocktimesParams,
};

export const getNativeCurrencyPriceSchema = {
  params: getNativeCurrencyPriceParams,
};

export type GetNativeCurrencyPriceRequest = TypedRequest<
  typeof getNativeCurrencyPriceSchema
>;

export type GetBlocktimesRequest = TypedRequest<typeof getBlocktimesSchema>;
