import { WebtriggerResponse } from '../types';

export const serverResponse = (
  message: string,
  parameters?: Record<string, unknown>,
  statusCode = 200,
): WebtriggerResponse => {
  const body = JSON.stringify({
    message,
    success: statusCode >= 200 && statusCode < 300,
    ...(parameters !== undefined && { parameters }),
  });
  const defaultHeaders = {
    'Content-Type': ['application/json'],
  };

  return {
    body,
    statusCode,
    headers: defaultHeaders,
  };
};
