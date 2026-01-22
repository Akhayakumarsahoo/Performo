import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";
import logger from "../utils/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    logger.warn({ err }, "AppError");
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof ZodError) {
    logger.warn({ errors: err.flatten() }, "Zod validation error");
    return res.status(400).json({ message: "Validation failed", errors: err.flatten() });
  }

  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";
  logger.error({ err, status }, "Unhandled error");
  res.status(status).json({ message });
}
