import redisClient from "../cache/cache.helpers";
import { LAMBDA } from "../environment";
import { CacheKey } from "./cache.constants";
import { HandlerReturnValue } from "./cache.types";
import { CacheModel } from "./cache.models";

export const CacheToExpTimeInSeconds: Record<CacheKey, number> = {
  [CacheKey.Price]: 180,
  [CacheKey.Fee]: 300,
  [CacheKey.ChainTime]: 15,
};

export const retrieveFromRedis = async <G extends HandlerReturnValue>(
  key: CacheKey,
  getLatestValue: () => Promise<G>
) => {
  const cachedValue = await redisClient.get(key);

  if (!cachedValue) {
    const expirationTime = CacheToExpTimeInSeconds[key];
    const latestValue = (await getLatestValue()).toString();

    await redisClient.set(key, latestValue, {
      EX: expirationTime,
    });

    return { [key]: latestValue };
  }

  return { [key]: cachedValue };
};

export const retrieveFromDb = async <G extends HandlerReturnValue>(
  key: CacheKey,
  getLatestValue: () => Promise<G>
) => {
  const document = await CacheModel.findOne({ key }).select([
    "-__v",
    "-_id",
    "-key",
  ]);

  if (!document) {
    const latestValue = (await getLatestValue()).toString();

    await CacheModel.create({
      key,
      value: latestValue,
      expiresAfterSeconds: CacheToExpTimeInSeconds[key],
    });

    return { [key]: latestValue };
  }

  return { [key]: document.value };
};

export const retrieveFromCache = async <G extends HandlerReturnValue>(
  key: CacheKey,
  getLatestValue: () => Promise<G>
) => {
  if (LAMBDA) {
    return await retrieveFromDb(key, getLatestValue);
  }

  return await retrieveFromRedis(key, getLatestValue);
};
