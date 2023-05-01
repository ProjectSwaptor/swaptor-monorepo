import { CreateSwapDto } from "../dtos/swaps.dtos";
import { Swap } from "../swaps.models";

export const getCreateSwapDtoStub = (): CreateSwapDto => ({
  id: "969f2ca3-c888-4b68-885f-83cdb3d6222e",
  signature:
    "0xf327851ede2ee28f20ee20492484d9e556b167ce327d5d08eff112f9b07f21a81531f83608edb5ce60f2e0a061f150a411a53d545d186816f5b49caf16f2b8c31c",
  swapType: 0,
  seller: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  buyer: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  offeredTokenAddress: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  offeredTokenData: "1",
  wantedTokenAddress: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  wantedTokenData: "1",
  chainId: "80001",
  expirationTime: "1680514090",
});

export const getSwapStub = (): Swap => {
  const swapDto = getCreateSwapDtoStub();
  const swap = { ...swapDto, active: true, createdAt: new Date() };

  return swap;
};

export const txHashStub =
  "0x5ae26731d39867c980f2f4a35d46185235df82e6fc0334434c32ac34c9dc9f14";
