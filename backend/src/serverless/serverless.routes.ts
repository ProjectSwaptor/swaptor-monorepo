import { Express, Router } from "express";

import { LAMBDA } from "../environment";

export const connectRouter = (app: Express, router: Router) => {
  if (LAMBDA) {
    app.use("/v1", router);
  } else {
    app.use(router);
  }
};
