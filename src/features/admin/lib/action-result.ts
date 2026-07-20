// No "server-only" here on purpose: this module is imported by client
// components ("use client" forms) for its types, and is unit-tested
// directly (action-result.test.ts) — both would break under server-only.

export type FieldErrors = Record<string, string>

export type ActionResult<T = void> =
  | { status: "success"; data?: T; message?: string }
  | { status: "error"; message: string; fieldErrors?: FieldErrors }
  | { status: "session_expired"; message: string }

const SESSION_EXPIRED_MESSAGE = "Tu sesión expiró, ingresa de nuevo"

export function ok<T = void>(data?: T, message?: string): ActionResult<T> {
  return { status: "success", data, message }
}

export function fail<T = void>(
  message: string,
  fieldErrors?: FieldErrors,
): ActionResult<T> {
  return { status: "error", message, fieldErrors }
}

export function sessionExpired<T = void>(): ActionResult<T> {
  return { status: "session_expired", message: SESSION_EXPIRED_MESSAGE }
}
