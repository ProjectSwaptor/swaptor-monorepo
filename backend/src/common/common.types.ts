import { z } from "zod";
import { TypedRequest as ZodRequest } from "zod-express-middleware";
import type { Listener } from "@ethersproject/providers";
import type { Event, EventFilter } from "ethers";
import { Chain } from "./common.constants";

export type TypedRequest<
  S extends {
    params?: z.AnyZodObject;
    query?: z.AnyZodObject;
    body?: z.AnyZodObject;
  }
> = ZodRequest<
  S["params"] extends z.AnyZodObject ? S["params"] : z.AnyZodObject,
  S["query"] extends z.AnyZodObject ? S["query"] : z.AnyZodObject,
  S["body"] extends z.AnyZodObject ? S["body"] : z.AnyZodObject
>;

export interface TypedEvent<
  TArgsArray extends Array<any> = any,
  TArgsObject = any
> extends Event {
  args: TArgsArray & TArgsObject;
}

export interface TypedEventFilter<_TEvent extends TypedEvent>
  extends EventFilter {}

export interface TypedListener<TEvent extends TypedEvent> {
  (...listenerArg: [...__TypechainArgsArray<TEvent>, TEvent]): void;
}

type __TypechainArgsArray<T> = T extends TypedEvent<infer U> ? U : never;

export interface OnEvent<TRes> {
  <TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>,
    listener: TypedListener<TEvent>
  ): TRes;
  (eventName: string, listener: Listener): TRes;
}

export type MinEthersFactory<C, ARGS> = {
  deploy(...a: ARGS[]): Promise<C>;
};

export type GetContractTypeFromFactory<F> = F extends MinEthersFactory<
  infer C,
  any
>
  ? C
  : never;

export type GetARGsTypeFromFactory<F> = F extends MinEthersFactory<any, any>
  ? Parameters<F["deploy"]>
  : never;

export type PromiseOrValue<T> = T | Promise<T>;

export type PickEnum<T, K extends T> = {
  [P in keyof K]: P extends K ? P : never;
};

export type SwaptorChains = PickEnum<Chain, Chain.Mumbai>;
