import { Chain } from "../common/common.constants";

export const CHAIN_TO_PRICE_FEED: Record<Chain, string> = {
  [Chain.Ethereum]: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  [Chain.Polygon]: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
  [Chain.Avalanche]: "0x0A77230d17318075983913bC2145DB16C7366156",
  [Chain.Mumbai]: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
};
