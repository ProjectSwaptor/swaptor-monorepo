import "express-async-errors";

import express from "express";
import cors from "cors";

import { LAMBDA } from "./environment";
import { connectRouter } from "./serverless/serverless.routes";
import { reuseDbConnection } from "./serverless/serverless.middlewares";
import { logHttpRequests } from "./loggers/loggers.middlewares";
import { handleErrors } from "./errors/errors.middlewares";
import swapRouter from "./swaps/swaps.routes";
import oracleRouter from "./oracles/oracles.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(logHttpRequests);

if (LAMBDA) {
  app.use(reuseDbConnection);
}

connectRouter(app, swapRouter);
connectRouter(app, oracleRouter);

app.use(handleErrors);

export default app;
