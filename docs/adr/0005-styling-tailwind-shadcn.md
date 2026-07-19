# ADR-0005: Tailwind CSS + shadcn/ui

## Estado

Accepted

## Fecha

2026-07-19

## Contexto

Las referencias de diseño del cliente (The North Face, Clemont, Apple) exigen tipografía y espaciado cuidados, navegación limpia con mega-menú por categorías, y bastante whitespace. Lograr ese nivel de pulido requiere un sistema de utilidades consistente y componentes accesibles que no se conviertan en una dependencia externa opaca.

## Decisión

Se usa Tailwind CSS v4 (CSS-first, sin `tailwind.config.ts` por defecto) como sistema de utilidades, junto con shadcn/ui para los componentes de interfaz.

## Alternativas consideradas

- **CSS Modules**: requiere escribir y mantener mucho más CSS a mano para alcanzar el nivel de pulido buscado, sin un sistema de diseño de base.
- **MUI / Chakra**: son librerías de componentes con su propio lenguaje visual fuerte, más costosas de personalizar para igualar referencias editoriales como North Face o Apple.
- **Bootstrap**: su estética por defecto está lejos del look minimalista/editorial buscado, y requeriría sobrescribir gran parte de sus estilos.

## Consecuencias

- Tailwind da un sistema de utilidades consistente para tipografía, espaciado y layout, alineado con los tokens de diseño del proyecto (ver `docs/specs/design-system.md`).
- shadcn/ui entrega componentes accesibles cuyo código vive dentro del repositorio (no es una dependencia de node_modules), lo que permite personalizarlos libremente.
- El equipo asume la responsabilidad de mantener el código de los componentes shadcn/ui que se copian al proyecto, en lugar de recibir actualizaciones automáticas de una librería externa.
