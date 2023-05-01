import { StatusCodes } from "http-status-codes";

export class HttpError extends Error {
  constructor(
    public message: string,
    public status: number = StatusCodes.INTERNAL_SERVER_ERROR,
    public additionalInfo: any = {}
  ) {
    super();
  }
}
