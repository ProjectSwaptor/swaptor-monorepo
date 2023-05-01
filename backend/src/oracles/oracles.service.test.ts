import { Chain } from "../common/common.constants";
import { CacheKey } from "../cache/cache.constants";
import * as cacheService from "../cache/cache.service";
import * as oraclesService from "../oracles/oracles.service";

describe("getEthUsdPrice", () => {
  test("should retrieve eth-usd price", async () => {
    const mockPrice = { [CacheKey.Price]: "1" };
    jest
      .spyOn(cacheService, "retrieveFromCache")
      .mockResolvedValueOnce(mockPrice as never);

    const price = await oraclesService.getNativeCurrencyPrice(Chain.Mumbai);

    expect(mockPrice).toEqual(price);
  });
});

describe("getBlockchainTime", () => {
  test("should retrieve blockchain time", async () => {
    const mockFee = { [CacheKey.ChainTime]: "1" };
    jest
      .spyOn(cacheService, "retrieveFromCache")
      .mockResolvedValueOnce(mockFee as never);

    const fee = await oraclesService.getBlockchainTime(Chain.Mumbai);

    expect(mockFee).toEqual(fee);
  });
});
