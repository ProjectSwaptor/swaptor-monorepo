export enum SwapType {
  ERC20_FOR_ERC20,
  ERC20_FOR_ERC721,
  ERC721_FOR_ERC20,
  ERC721_FOR_ERC721,
}

export enum SwaptorEvent {
  SwapParticipants = "SwapParticipants",
  SwapDetails = "SwapDetails",
  SwapCancelled = "SwapCancelled",
}
export const SWAP_ID_LENGTH = 36;

export enum SwaptorProperty {
  Fee = "fee",
  FreeTrialEndTime = "freeTrialEndTime",
}
