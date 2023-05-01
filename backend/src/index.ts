import serverless from "serverless-http";
import { mongoose } from "@typegoose/typegoose";

import app from "./app";
import redisClient from "./cache/cache.helpers";
import logger from "./loggers/loggers.instances";
import { DB, LAMBDA, PORT } from "./environment";

const main = async () => {
  try {
    await mongoose.connect(DB);
    await redisClient.connect();
  } catch (e) {
    logger.error(e);
  }

  app.listen(PORT, () => {
    logger.info(`App is listening on port: ${PORT}`);
  });
};

if (!LAMBDA) {
  main();
}

export const handler = serverless(app, {
  request: (req: any, event: any, context: any) => {
    context.callbackWaitsForEmptyEventLoop = false;
    req.event = event;
    req.context = context;
  },
});
