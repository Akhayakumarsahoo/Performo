import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";
  logger.error({ err, status }, "Unhandled error");
  res.status(status).json({ message });
}
