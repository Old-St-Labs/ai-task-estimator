/**
 * lib/api-response.ts
 *
 * Standardised response helpers for all route handlers.
 *
 * Shape:
 *   { "code": "200", "data": <payload> }
 *   { "code": "404", "data": { "message": "Not found" } }
 */

import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  code: string;
  data: T;
}

export interface ApiErrorData {
  message: string;
  details?: unknown;
}

// ---------------------------------------------------------------------------
// Success helpers
// ---------------------------------------------------------------------------

export function ok<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ code: String(status), data }, { status });
}

export function created<T>(data: T): NextResponse<ApiResponse<T>> {
  return ok(data, 201);
}

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------

export function notFound(message: string = "Not found"): NextResponse<ApiResponse<ApiErrorData>> {
  return NextResponse.json({ code: "404", data: { message } }, { status: 404 });
}

export function badRequest(
  message: string = "Bad request",
  details?: unknown
): NextResponse<ApiResponse<ApiErrorData>> {
  return NextResponse.json(
    { code: "400", data: { message, ...(details ? { details } : {}) } },
    { status: 400 }
  );
}

export function internalError(
  message: string = "Internal server error"
): NextResponse<ApiResponse<ApiErrorData>> {
  return NextResponse.json({ code: "500", data: { message } }, { status: 500 });
}
