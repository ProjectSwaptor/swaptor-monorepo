import { Request, Response, NextFunction } from "express";

import { connectToDb } from "../db/db.helpers";

export const reuseDbConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await connectToDb();

  next();
};
