import { mongoose } from "@typegoose/typegoose";

import { DB } from "../environment";
import logger from "../loggers/loggers.instances";

let connection: mongoose.Connection;

export const connectToDb = async () => {
  if (!connection) {
    try {
      await mongoose.connect(DB);
      connection = mongoose.connection;

      return connection;
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }
};
