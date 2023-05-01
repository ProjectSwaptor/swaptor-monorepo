import { Request, Response, NextFunction } from "express";
import { HttpError } from "./errors.classes";
import { StatusCodes } from "http-status-codes";

import logger from "../loggers/loggers.instances";

const DEFAULT_ERROR_MESSAGE = "Internal server error";

export const handleErrors = (
  err: TypeError | HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err);

  if (!(err instanceof HttpError)) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(DEFAULT_ERROR_MESSAGE);
  }

  return res.status((err as HttpError).status).send(err);
};
