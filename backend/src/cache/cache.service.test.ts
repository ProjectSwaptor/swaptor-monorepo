import * as cacheService from "../cache/cache.service";
import * as cacheConstants from "./cache.constants";
import redisService from "../cache/cache.helpers";
import { CacheModel } from "./cache.models";
import { CacheKey } from "./cache.constants";

describe("retrieveFromRedis", () => {
  test("should retrieve value from cache if it is present", async () => {
    const cachedValue = "1";
    const key = "abc";

    jest.spyOn(redisService, "get").mockResolvedValueOnce(cachedValue as never);

    const res = await cacheService.retrieveFromRedis(
      key as unknown as CacheKey,
      async () => ""
    );

    expect(res).toEqual({ [key]: cachedValue });
  });

  test("should execute getLatestValue if no value was present in cache", async () => {
    const value = "1";
    const key = "abc" as CacheKey;
    const getLatestValue = jest.fn().mockImplementationOnce(async () => value);

    jest.spyOn(redisService, "get").mockResolvedValueOnce(null);
    jest.spyOn(redisService, "set").mockResolvedValueOnce(null);

    //@ts-ignore
    cacheConstants.CacheKey = jest.fn().mockImplementationOnce(() => key);

    const res = await cacheService.retrieveFromRedis(
      key as unknown as CacheKey,
      getLatestValue
    );

    expect(getLatestValue).toBeCalled();
    expect(res).toEqual({ [key]: value });
  });
});

describe("retrieveFromDb", () => {
  test("should retrieve value from cache if it is present", async () => {
    const cachedValue = "1";
    const key = "abc";

    jest.spyOn(CacheModel, "findOne").mockImplementationOnce(
      jest.fn().mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValueOnce({ value: cachedValue }),
      }))
    );

    const res = await cacheService.retrieveFromDb(
      key as unknown as CacheKey,
      async () => ""
    );

    expect(res).toEqual({ [key]: cachedValue });
  });

  test("should execute getLatestValue if no value was present in cache", async () => {
    const value = "1";
    const key = "abc" as CacheKey;
    const getLatestValue = jest.fn().mockImplementationOnce(async () => value);

    jest.spyOn(CacheModel, "findOne").mockImplementationOnce(
      jest.fn().mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValueOnce(null),
      }))
    );

    jest.spyOn(CacheModel, "create").mockResolvedValueOnce(null as never);

    const res = await cacheService.retrieveFromDb(
      key as unknown as CacheKey,
      getLatestValue
    );

    expect(getLatestValue).toBeCalled();
    expect(res).toEqual({ [key]: value });
  });
});
