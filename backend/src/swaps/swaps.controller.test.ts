import { StatusCodes } from "http-status-codes";
import { nanoid } from "nanoid";
import request from "supertest";

import app from "../app";
import * as swapsService from "../swaps/swaps.service";
import { getCreateSwapDtoStub, getSwapStub } from "./stubs/swaps.stubs";
import { SWAP_ID_LENGTH } from "./swaps.constants";

const FEE_IN_USD = "500000000";

describe("POST /swaps", () => {
  test("Should successfully create a swap when params are valid", async () => {
    const stub = getCreateSwapDtoStub();
    const id = stub.id;
    jest.spyOn(swapsService, "createSwap").mockResolvedValueOnce(id as never);

    const response = await request(app).post("/swaps").send(stub);

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toEqual({ id: id });
  });

  test("Shouldn't return a valid response if signature is invalid", async () => {
    const stub = getCreateSwapDtoStub();
    stub.signature =
      "0x6ad172dcac6f65012f00feceb35196f1d12dd4e37b8d905c96b46d3eb8bc93007bf03d6ee0d9ce5b42688f1268bc7210f2ce500b5c20f5fa125cf3a4e1d4e6651b";

    const response = await request(app).post("/swaps").send(stub);
    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });
});

describe("GET /swaps", () => {
  test("Should return valid response if swap is found", async () => {
    const stub = getCreateSwapDtoStub();
    jest.spyOn(swapsService, "getSwaps").mockResolvedValueOnce([stub] as never);

    const response = await request(app).get(`/swaps`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual([stub]);
  });
});

describe("GET /swap", () => {
  test("Should return valid response if swap is found", async () => {
    const stub = getCreateSwapDtoStub();
    jest.spyOn(swapsService, "getSwap").mockResolvedValueOnce(stub as never);

    const swapId = nanoid(SWAP_ID_LENGTH);
    const response = await request(app).get(`/swaps/${swapId}`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual(stub);
  });

  test("Should return bad request if swap id isn't uuid", async () => {
    jest.spyOn(swapsService, "getSwap").mockResolvedValueOnce(null as never);

    const invalidUuid = "4";
    const response = await request(app).get(`/swaps/${invalidUuid}`);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });
});

describe("GET /swaps/fee", () => {
  test("Should successfully retrieve fee in USD from all networks where Swaptor is deployed", async () => {
    jest
      .spyOn(swapsService, "getFeeInUsd")
      .mockReturnValueOnce(FEE_IN_USD as never);

    const response = await request(app).get(`/swaps/fee`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.text).toBe(FEE_IN_USD);
  });
});

describe("PATCH /swaps/:id/update-state", () => {
  const defaultSwap = getSwapStub();
  const defaultTxHash =
    "0x6e401a578fc9684901afeeafae43477e14b7296c13e5f6159e0e410b61fb5ac7";

  test("Should successfully update swap state", async () => {
    jest
      .spyOn(swapsService, "getSwap")
      .mockReturnValueOnce(defaultSwap as never);
    jest
      .spyOn(swapsService, "updateSwapState")
      .mockReturnValueOnce({} as never);

    const response = await request(app)
      .patch(`/swaps/${defaultSwap.id}/update-state`)
      .send({ transactionHash: defaultTxHash });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual({ id: defaultSwap.id, active: false });
  });

  test("Shouldn't update swap state if id is invalid", async () => {
    jest
      .spyOn(swapsService, "getSwap")
      .mockReturnValueOnce(defaultSwap as never);
    jest
      .spyOn(swapsService, "updateSwapState")
      .mockReturnValueOnce({} as never);

    const invalidId = defaultSwap.id + "invalid";
    const response = await request(app)
      .patch(`/swaps/${invalidId}/update-state`)
      .send({ transactionHash: defaultTxHash });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  test("Shouldn't update swap state if transaction hash is invalid", async () => {
    jest
      .spyOn(swapsService, "getSwap")
      .mockReturnValueOnce(defaultSwap as never);
    jest
      .spyOn(swapsService, "updateSwapState")
      .mockReturnValueOnce({} as never);

    const invalidTransactionHash = defaultTxHash + "invalid";
    const response = await request(app)
      .patch(`/swaps/${defaultSwap.id}/update-state`)
      .send({ transactionHash: invalidTransactionHash });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });
});
