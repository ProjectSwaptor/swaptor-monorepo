import { getModelForClass, index, prop } from "@typegoose/typegoose";

import { SwapType } from "./swaps.constants";

@index({ seller: 1 })
@index({ buyer: 1 })
@index({ seller: 1, chainId: 1 })
@index({ buyer: 1, chainId: 1 })
@index({ createdAt: -1, seller: 1 })
@index({ createdAt: -1, buyer: 1 })
@index({ createdAt: -1, seller: 1, chainId: 1 })
@index({ createdAt: -1, buyer: 1, chainId: 1 })
export class Swap {
  @prop({ type: String, unique: true })
  public id!: string;

  @prop({ type: Boolean, default: true })
  public active!: boolean;

  @prop({ type: String, unique: true })
  public signature!: string;

  @prop({ type: Number, required: true })
  public swapType!: SwapType;

  @prop({ type: String, required: true })
  public seller!: string;

  @prop({ type: String, required: true })
  public buyer!: string;

  @prop({ type: String, required: true })
  public offeredTokenAddress!: string;

  @prop({ type: String, required: true })
  public offeredTokenData!: string;

  @prop({ type: String, required: true })
  public wantedTokenAddress!: string;

  @prop({ type: String, required: true })
  public wantedTokenData!: string;

  @prop({ type: String, required: true })
  public chainId!: string;

  @prop({ type: String, required: true })
  public expirationTime!: string;

  @prop({ type: Date, default: Date.now() })
  public createdAt!: Date;
}

export const SwapModel = getModelForClass(Swap);