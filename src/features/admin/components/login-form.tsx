"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { login } from "../actions/login"

const SESSION_EXPIRED_MESSAGE = "Tu sesión expiró, ingresa de nuevo"

type LoginFormProps = {
  expired: boolean
}

// RF-1 (admin-panel.md): no signup link anywhere — registration is
// disabled both in the UI and at the Supabase Auth API level (setup guide).
export function LoginForm({ expired }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(login, null)

  const showExpiredBanner = expired || state?.status === "session_expired"
  const fieldErrors = state?.status === "error" ? state.fieldErrors : undefined
  const errorMessage = state?.status === "error" ? state.message : null

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Panel de administración</CardTitle>
        <CardDescription>Ingresa con tu correo y contraseña.</CardDescription>
      </CardHeader>
      <CardContent>
        {showExpiredBanner ? (
          <p
            role="alert"
            className="bg-destructive/10 text-destructive mb-4 rounded-md px-3 py-2 text-sm"
          >
            {SESSION_EXPIRED_MESSAGE}
          </p>
        ) : null}

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              aria-invalid={Boolean(fieldErrors?.email)}
            />
            {fieldErrors?.email ? (
              <p role="alert" className="text-destructive text-sm">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(fieldErrors?.password)}
            />
            {fieldErrors?.password ? (
              <p role="alert" className="text-destructive text-sm">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          {errorMessage ? (
            <p role="alert" className="text-destructive text-sm">
              {errorMessage}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={pending}>
            Ingresar
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
