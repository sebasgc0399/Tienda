import "./globals.css"

import type { Metadata } from "next"
import { Fraunces, Inter } from "next/font/google"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Tienda",
  description:
    "Detalles hechos a mano: ramos, gorras y decoración. Pedidos por WhatsApp.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
