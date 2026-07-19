# ADR-0003: Checkout vía WhatsApp sin pasarela de pago

## Estado

Accepted

## Fecha

2026-07-19

## Contexto

El negocio ya opera y cierra ventas por WhatsApp de forma manual. Integrar una pasarela de pago implica costos de comisión por transacción, requisitos de cumplimiento PCI y complejidad de integración que no se justifican en esta primera versión del sitio, cuyo objetivo es digitalizar el catálogo y facilitar el pedido, no procesar pagos en línea.

## Decisión

El carrito no procesa pagos: genera un mensaje pre-armado y redirige a `wa.me` con el pedido, para que la venta se cierre por WhatsApp como ya ocurre hoy.

## Alternativas consideradas

- **Wompi**: pasarela colombiana viable a futuro, pero suma comisiones y complejidad de integración/reconciliación que no aportan valor en esta etapa.
- **Mercado Pago**: mismas objeciones que Wompi; se descarta para v1.
- **Formulario de pedido por email**: pierde la inmediatez y el canal que la dueña del negocio ya usa y domina (WhatsApp).

## Consecuencias

- Cero costos de transacción y ningún requisito de cumplimiento PCI en esta versión.
- La decisión es reversible: una pasarela de pago (Wompi, Mercado Pago) puede añadirse más adelante sin rediseñar el modelo de datos.
- No se persiste ningún pedido en base de datos; el registro de la venta vive en la conversación de WhatsApp, no en el sistema.
- La experiencia de compra depende de que el número de WhatsApp de la tienda esté siempre disponible y correctamente configurado.
