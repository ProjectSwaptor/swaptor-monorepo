import {
  DocumentType,
  getModelForClass,
  index,
  prop,
} from "@typegoose/typegoose";

import { CacheKey } from "../cache/cache.constants";
import { ONE_SECOND } from "../common/common.constants";

@index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
export class Cache {
  @prop({ unique: true, type: String })
  public key!: CacheKey;

  @prop({ type: String })
  public value!: string;

  @prop({
    type: Number,
  })
  public expiresAfterSeconds!: number;

  @prop({
    type: Date,
    default: function (this: DocumentType<Cache>) {
      const expiresAt = Date.now() + this.expiresAfterSeconds * ONE_SECOND;

      return expiresAt;
    },
  })
  public expiresAt?: Date;
}

export const CacheModel = getModelForClass(Cache);
