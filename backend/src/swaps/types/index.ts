import { BigNumberish } from "ethers";
import { SwaptorEvent } from "../swaps.constants";

export type SwapParticipants = [
  id: {
    hash: string;
  },
  seller: string,
  buyer: string
];

export type SwapCancelled = [id: { hash: string }];

export type SwapDetails = [
  id: { hash: string },
  offeredERC721: string,
  wantedERC721: string,
  offeredTokenData: BigNumberish,
  wantedTokenData: BigNumberish,
  expirationTime: BigNumberish
];

export type SwaptorEventParams<T extends SwaptorEvent> =
  T extends SwaptorEvent.SwapParticipants
    ? SwapParticipants
    : T extends SwaptorEvent.SwapDetails
    ? SwapDetails
    : T extends SwaptorEvent.SwapCancelled
    ? SwapCancelled
    : never;
