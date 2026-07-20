import { ChevronDown } from "lucide-react"

type FooterColumnProps = {
  title: string
  children: React.ReactNode
}

// Mobile: native <details>/<summary>, zero JS. From md up, forced open via
// Tailwind's group-open variant (md:flex always wins over the hidden
// default, regardless of the [open] attribute) — design-system.md, Footer.
function FooterColumn({ title, children }: FooterColumnProps) {
  return (
    <details className="group border-border border-b py-4 md:border-0 md:py-0">
      <summary className="font-heading focus-visible:ring-ring/50 flex cursor-pointer list-none items-center justify-between rounded-md text-base font-semibold outline-none focus-visible:ring-3 md:pointer-events-none md:cursor-default [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          aria-hidden="true"
          className="size-4 transition-transform group-open:rotate-180 md:hidden"
        />
      </summary>
      <div className="text-muted-foreground mt-3 hidden flex-col gap-2 text-sm group-open:flex md:flex">
        {children}
      </div>
    </details>
  )
}

export function SiteFooter() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  const year = new Date().getFullYear()

  return (
    <footer className="border-border bg-secondary/40 border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-x-8 px-4 py-8 sm:px-6 md:grid-cols-4 md:py-12">
        <FooterColumn title="Información">
          <span>Preguntas frecuentes</span>
          <span>Política de cambios</span>
          <span>Envíos</span>
        </FooterColumn>
        <FooterColumn title="Contacto">
          {whatsappNumber ? (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary focus-visible:ring-ring/50 w-fit rounded-md outline-none focus-visible:ring-3"
            >
              Escríbenos por WhatsApp
            </a>
          ) : (
            <span>Escríbenos por WhatsApp</span>
          )}
        </FooterColumn>
        <FooterColumn title="Novedades">
          <p>
            Muy pronto vas a poder suscribirte para conocer nuestras novedades
            primero.
          </p>
        </FooterColumn>
        <FooterColumn title="Redes">
          <span>Instagram</span>
          <span>Facebook</span>
        </FooterColumn>
      </div>
      <div className="border-border text-muted-foreground border-t px-4 py-4 text-center text-sm sm:px-6">
        © {year} Tienda
      </div>
    </footer>
  )
}
