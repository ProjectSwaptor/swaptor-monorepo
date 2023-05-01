import * as swapsService from "../swaps/swaps.service";
import { MAX_RESOURCE_LIMIT } from "../environment";
import {
  getCreateSwapDtoStub,
  getSwapStub,
  txHashStub,
} from "./stubs/swaps.stubs";
import { SwapModel } from "./swaps.models";

import * as SwapsUtils from "./swaps.utils";

describe("createSwap", () => {
  test("Should successfully create a swap when params are valid", async () => {
    const stub = getCreateSwapDtoStub();
    jest.spyOn(SwapModel, "create").mockResolvedValueOnce(stub as never);

    const id = await swapsService.createSwap(stub);

    expect(id).toBe(stub.id);
  });
});

describe("getSwap", () => {
  test("Should successfully get swap that exists", async () => {
    const stub = getCreateSwapDtoStub();
    jest.spyOn(SwapModel, "findOne").mockImplementationOnce(
      jest.fn().mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValueOnce(stub as never),
      }))
    );

    const swap = await swapsService.getSwap(stub.id);

    expect(swap).toBe(stub);
  });

  test("Should throw error if swap doesn't exist", async () => {
    const stub = getCreateSwapDtoStub();
    jest.spyOn(SwapModel, "findOne").mockImplementationOnce(
      jest.fn().mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValueOnce(null),
      }))
    );

    await expect(async () => {
      await swapsService.getSwap(stub.id);
    }).rejects.toThrow();
  });
});

describe("getSwaps", () => {
  let mockLimit: jest.Mock<any, any, any>;

  beforeEach(() => {
    mockLimit = jest.fn().mockImplementationOnce(
      jest.fn().mockImplementationOnce(() => ({
        select: jest.fn().mockImplementationOnce(
          jest.fn().mockImplementationOnce(() => ({
            sort: jest.fn().mockImplementationOnce(
              jest.fn().mockImplementationOnce(() => {
                return {};
              })
            ),
          }))
        ),
      }))
    );

    jest.spyOn(SwapModel, "find").mockImplementationOnce(
      jest.fn().mockImplementationOnce(() => ({
        limit: mockLimit,
      }))
    );
  });

  test("Shouldn't return more swaps than defined by limit", async () => {
    await swapsService.getSwaps({ limit: MAX_RESOURCE_LIMIT + 1 });

    expect(mockLimit).toBeCalledWith(MAX_RESOURCE_LIMIT);
  });

  test("Should return number of swaps defined by limit if the limit is lower than max", async () => {
    await swapsService.getSwaps({ limit: MAX_RESOURCE_LIMIT - 1 });

    expect(mockLimit).toBeCalledWith(MAX_RESOURCE_LIMIT - 1);
  });

  test("Should return mswaps defined by max limit if no limit was provided", async () => {
    await swapsService.getSwaps({});

    expect(mockLimit).toBeCalledWith(MAX_RESOURCE_LIMIT);
  });
});

describe("updateSwapState", () => {
  test("Should throw error if swap isn't active", async () => {
    const stub = getSwapStub();
    stub.active = false;

    await expect(async () => {
      await swapsService.updateSwapState(stub, txHashStub);
    }).rejects.toThrow();
  });

  test("Should throw error if no swap event is found", async () => {
    const stub = getSwapStub();

    jest
      .spyOn(SwapsUtils, "getSwaptorEventParams")
      .mockResolvedValueOnce([] as never);

    await expect(async () => {
      await swapsService.updateSwapState(stub, txHashStub);
    }).rejects.toThrow();
  });

  test("Should throw error if no swap event is found", async () => {
    const stub = getSwapStub();

    jest
      .spyOn(SwapsUtils, "getSwaptorEventParams")
      .mockResolvedValueOnce([] as never);

    await expect(async () => {
      await swapsService.updateSwapState(stub, txHashStub);
    }).rejects.toThrow();
  });
});
