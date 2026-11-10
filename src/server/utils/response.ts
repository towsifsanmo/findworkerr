import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  meta?: Record<string, any>;
}

export function successResponse<T>(data: T, message?: string, meta?: Record<string, any>, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      meta,
    },
    { status }
  );
}

export function errorResponse(error: string, status = 400, code?: string) {
  logger.warn({ error, status, code }, 'API Error response returned');
  return NextResponse.json(
    {
      success: false,
      error,
      code,
    },
    { status }
  );
}

export function unauthorizedResponse(error = 'Authentication required.') {
  return errorResponse(error, 401, 'UNAUTHORIZED');
}

export function forbiddenResponse(error = 'Insufficient permissions.') {
  return errorResponse(error, 403, 'FORBIDDEN');
}

export function notFoundResponse(error = 'Requested resource not found.') {
  return errorResponse(error, 404, 'NOT_FOUND');
}

export function serverErrorResponse(err: unknown, message = 'Internal server error.') {
  logger.error({ err }, 'Unhandled server error in API route');
  return errorResponse(message, 500, 'INTERNAL_SERVER_ERROR');
}

