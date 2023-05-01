import { StatusCodes } from "http-status-codes";
import request from "supertest";

import app from "../app";
import * as oraclesService from "./oracles.service";
import { Chain } from "../common/common.constants";

describe("GET /chains/:chain/price", () => {
  test("Should successfully retrieve price", async () => {
    const expectedPrice = "180492310000";
    jest
      .spyOn(oraclesService, "getNativeCurrencyPrice")
      .mockReturnValueOnce(expectedPrice as never);

    const response = await request(app).get(`/chains/${Chain.Ethereum}/price`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.text).toBe(expectedPrice);
  });

  test("Shouldn't retrieve price if chain id is not valid", async () => {
    const invalidChain = "invalidChain";
    const response = await request(app).get(`/chains/${invalidChain}/price`);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });
});

describe("GET /chains/:chain/time", () => {
  test("Should successfully retrieve blockchain time", async () => {
    const expectedTimestamp = Math.floor(
      new Date().getTime() / 1000
    ).toString();

    jest
      .spyOn(oraclesService, "getBlockchainTime")
      .mockReturnValueOnce(expectedTimestamp as never);

    const response = await request(app).get(`/chains/${Chain.Ethereum}/time`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.text).toBe(expectedTimestamp);
  });

  test("Shouldn't retrieve blockchain time if chain id is not valid", async () => {
    const invalidChain = "invalidChain";
    const response = await request(app).get(`/chains/${invalidChain}/time`);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });
});
