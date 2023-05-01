import * as redis from "redis";

import { REDIS } from "../environment";
import logger from "../loggers/loggers.instances";

const client = redis.createClient({
  url: REDIS,
});

client.on("connect", () => {
  logger.info("Redis client connected");
});

client.on("error", (e: any) => {
  logger.error(e);

  client.disconnect();
});

export const connected = async () => {
  try {
    await client.ping();

    return true;
  } catch (e) {
    logger.crit(e);

    return false;
  }
};

export default client;
