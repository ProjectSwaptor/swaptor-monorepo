import * as dotenv from "dotenv";

dotenv.config();

export const LAMBDA = process.env.LAMBDA || false;
export const PORT = process.env.PORT || "8080";
export const DB = process.env.DB || "mongodb://localhost:27017/";
export const REDIS = process.env.REDIS || "redis://localhost:6379/";
export const MAX_BLOCK_RANGE = +(process.env.MAX_BLOCK_RANGE || "3000");
export const MAX_RESOURCE_LIMIT = +(process.env.MAX_BLOCK_RANGE || "50");
