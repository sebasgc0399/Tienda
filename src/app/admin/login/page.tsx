import type { Metadata } from "next"

import { LoginForm } from "@/features/admin/components/login-form"

export const metadata: Metadata = {
  title: "Ingresar",
}

type LoginPageProps = {
  searchParams: Promise<{ motivo?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { motivo } = await searchParams

  return <LoginForm expired={motivo === "expirada"} />
}
