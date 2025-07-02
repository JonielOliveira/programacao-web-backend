import { Response } from "express";

export function errorResponse(
  res: Response,
  status: number,
  message: string,
  code?: string,
  details?: string
) {
  const errorPayload: Record<string, string> = { message };
  if (code) errorPayload.code = code;
  if (details) errorPayload.details = details;

  return res.status(status).json({
    success: false,
    error: errorPayload
  });
}

export function successResponse<T>(
  res: Response,
  data: T,
  message?: string
) {
  const payload: Record<string, any> = {
    success: true,
    data
  };

  if (message) payload.message = message;

  return res.status(200).json(payload);
}
