import { Request, Response, NextFunction } from "express";

import logger from "./loggers.instances";

export const logHttpRequests = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const message = JSON.stringify({
    ip: req.ip,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
  });

  logger.http(message);

  next();
};
