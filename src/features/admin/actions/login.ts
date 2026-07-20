"use server"

import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

import type { ActionResult } from "../lib/action-result"
import { fail } from "../lib/action-result"

// RF-1 (admin-panel.md): email/password against Supabase Auth, no signup
// path. Validation here is a client-facing convenience — Supabase Auth is
// still the source of truth for whether the credentials are correct.
export async function login(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get("email")
  const password = formData.get("password")

  const fieldErrors: Record<string, string> = {}
  if (typeof email !== "string" || email.trim() === "") {
    fieldErrors.email = "Ingresa tu correo"
  }
  if (typeof password !== "string" || password === "") {
    fieldErrors.password = "Ingresa tu contraseña"
  }
  if (Object.keys(fieldErrors).length > 0) {
    return fail("Revisa los campos marcados", fieldErrors)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: email as string,
    password: password as string,
  })

  // Generic message on purpose: never reveal whether the email exists
  // (admin-panel.md, Seguridad — no user enumeration).
  if (error) {
    return fail("Correo o contraseña incorrectos")
  }

  redirect("/admin/productos")
}
