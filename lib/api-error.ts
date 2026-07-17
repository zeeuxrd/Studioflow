import { NextResponse } from 'next/server';

export function apiError(message: string, status: number, code?: string) {
  return NextResponse.json(
    { error: message, ...(code && { code }) },
    { status }
  );
}

export function unauthorized(msg = 'Unauthorized') {
  return apiError(msg, 401);
}

export function notFound(msg = 'Not found') {
  return apiError(msg, 404);
}

export function badRequest(msg = 'Bad request') {
  return apiError(msg, 400);
}

export function rateLimited(msg: string) {
  return apiError(msg, 403, 'RATE_LIMITED');
}

export function serverError(msg = 'Something went wrong') {
  return apiError(msg, 500);
}
