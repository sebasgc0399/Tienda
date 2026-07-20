import { ChevronDown } from "lucide-react"

type FooterColumnProps = {
  title: string
  children: React.ReactNode
}

// Content renders twice on purpose: closed <details> content is hidden via
// UA content-visibility in modern Chrome, so a CSS "force open" trick on the
// <details> itself no longer reveals it at md+ (verified in live Chrome).
// Instead: a static always-visible block for md+ and a native <details>
// accordion for mobile, each showing only at its own breakpoint — zero JS.
function FooterColumn({ title, children }: FooterColumnProps) {
  return (
    <div className="border-border border-b py-4 md:border-0 md:py-0">
      <div className="hidden md:block">
        <h3 className="font-heading text-base font-semibold">{title}</h3>
        <div className="text-muted-foreground mt-3 flex flex-col gap-2 text-sm">
          {children}
        </div>
      </div>
      <details className="group md:hidden">
        <summary className="font-heading focus-visible:ring-ring/50 flex cursor-pointer list-none items-center justify-between rounded-md text-base font-semibold outline-none focus-visible:ring-3 [&::-webkit-details-marker]:hidden">
          {title}
          <ChevronDown
            aria-hidden="true"
            className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <div className="text-muted-foreground mt-3 flex flex-col gap-2 text-sm">
          {children}
        </div>
      </details>
    </div>
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
