import { describe, expect, it } from "vitest"

import { fail, ok, sessionExpired } from "./action-result"

describe("ok", () => {
  it("builds a success result with data and message", () => {
    expect(ok({ id: "1" }, "Guardado")).toEqual({
      status: "success",
      data: { id: "1" },
      message: "Guardado",
    })
  })

  it("builds a success result with no arguments", () => {
    expect(ok()).toEqual({
      status: "success",
      data: undefined,
      message: undefined,
    })
  })
})

describe("fail", () => {
  it("builds an error result with a message only", () => {
    expect(fail("Correo o contraseña incorrectos")).toEqual({
      status: "error",
      message: "Correo o contraseña incorrectos",
      fieldErrors: undefined,
    })
  })

  it("builds an error result with field errors", () => {
    expect(
      fail("Revisa los campos marcados", { email: "Ingresa tu correo" }),
    ).toEqual({
      status: "error",
      message: "Revisa los campos marcados",
      fieldErrors: { email: "Ingresa tu correo" },
    })
  })
})

describe("sessionExpired", () => {
  it("builds a session_expired result with the fixed Spanish message", () => {
    expect(sessionExpired()).toEqual({
      status: "session_expired",
      message: "Tu sesión expiró, ingresa de nuevo",
    })
  })
})
