# Spec: Carrito y checkout por WhatsApp

## Objetivo

El carrito permite a la clienta armar un pedido de productos y enviarlo a la dueña del negocio por WhatsApp, sin pasarela de pago ni backend de pedidos (ver [ADR-0003](../adr/0003-whatsapp-checkout-no-payment-gateway.md)).

## Alcance / Fuera de alcance

**Alcance:**
- Carrito persistido en `localStorage` del navegador (client-side, sin backend).
- Añadir producto, quitar producto, editar cantidad.
- Cálculo de subtotal por ítem y total del carrito.
- Botón "Pedir por WhatsApp" que arma un mensaje en español y abre `wa.me` con el número del negocio.

**Fuera de alcance:**
- Pasarela de pago (ver ADR-0003).
- Persistencia de pedidos en base de datos — el pedido "vive" en la conversación de WhatsApp, no en Supabase.
- Variantes de producto (tallas, colores) — no existen en v1 (ver [data-model.md](./data-model.md)).
- Cálculo de costo de envío, inventario en tiempo real o reservas de stock.
- Historial de pedidos o cuentas de cliente.

## Requisitos funcionales

| ID | Requisito | Detalle |
|----|-----------|---------|
| RF-1 | Almacenamiento client-side | El carrito vive en `localStorage` bajo una clave fija (p. ej. `tienda:cart`); no existe tabla de carritos en Supabase. |
| RF-2 | Añadir producto | Agrega el producto con cantidad 1; si ya está en el carrito, incrementa la cantidad existente. |
| RF-3 | Quitar producto | Elimina el ítem completo del carrito. |
| RF-4 | Editar cantidad | Permite aumentar o disminuir la cantidad de un ítem; el mínimo es 1 (para llegar a 0 se usa "quitar"). |
| RF-5 | Subtotal por ítem | `quantity * price`, con `price` en COP entero (ver data-model.md). |
| RF-6 | Total del carrito | Suma de los subtotales de todos los ítems. |
| RF-7 | Botón "Pedir por WhatsApp" | Construye el mensaje (formato abajo) y abre `https://wa.me/<NEXT_PUBLIC_WHATSAPP_NUMBER>?text=<encodeURIComponent(mensaje)>` en una pestaña nueva. |
| RF-8 | Número de WhatsApp único vía env var | El número sale de `NEXT_PUBLIC_WHATSAPP_NUMBER`; nunca se hardcodea en el código fuente. El valor debe ser el número completo en formato internacional, solo dígitos (código de país + número), sin `+`, sin ceros a la izquierda y sin espacios, guiones ni paréntesis — RF-7 lo interpola tal cual en la URL de `wa.me`, sin normalizarlo. Ejemplo para Colombia: `NEXT_PUBLIC_WHATSAPP_NUMBER=573001234567` (código de país 57 + número). Un valor como `+57 300 123 4567` rompe el enlace. |

### Formato del mensaje

Una línea por ítem con nombre, cantidad, precio unitario y subtotal de línea; al final, el total. Ejemplo con dos productos:

```
Hola, quiero hacer este pedido:

1. Ramo Primavera x2 - $45.000 c/u = $90.000
2. Gorra Bordada x1 - $35.000 c/u = $35.000

Total: $125.000
```

Los montos se formatean como pesos colombianos (COP) sin decimales, con prefijo `$` y punto como separador de miles (por ejemplo, `$45.000`), igual que en el ejemplo de mensaje anterior.

## Escenarios de usuario

1. La clienta navega el catálogo, añade dos productos al carrito, ajusta la cantidad de uno a 2, revisa el subtotal por ítem y el total, y presiona "Pedir por WhatsApp". Se abre WhatsApp (app o web) con el mensaje prellenado, listo para enviar a la dueña.

## Casos borde

- **Carrito vacío**: el botón "Pedir por WhatsApp" queda deshabilitado o no se muestra; no se genera ningún mensaje ni se abre `wa.me`.
- **Longitud máxima de la URL `wa.me`**: pedidos con muchos ítems o nombres largos pueden generar una URL extensa. `wa.me` tolera URLs largas, pero como salvaguarda se debe advertir o truncar el mensaje cuando supere un umbral razonable (decisión de implementación; ver preguntas abiertas).
- **Producto no disponible entre añadir y checkout**: el carrito no valida disponibilidad ni precio contra la base de datos en cada render. Antes de generar el mensaje se revalida `availability`, `is_active` **y `price`** del producto contra `products`; si `availability`/`is_active` cambiaron, se marca el ítem y se pide confirmación o remoción antes de continuar. El subtotal por ítem y el total del mensaje se recalculan siempre a partir del `price` recién leído de la base de datos, nunca del valor guardado en `localStorage` — cierra la vía más directa para manipular el precio desde devtools antes de enviar el pedido, sin costo adicional porque la fila del producto ya se está consultando en este mismo paso.
- **Caracteres especiales y emojis**: nombres de producto con tildes, ñ u otros caracteres UTF-8 se codifican correctamente porque `encodeURIComponent` maneja Unicode de forma nativa; no se requiere sanitización adicional.

## Nota operativa

El mensaje de WhatsApp lo arma el navegador de la clienta a partir de `localStorage` y no queda firmado ni verificado por un servidor. La revalidación de precio del caso borde anterior cierra la manipulación antes del envío, pero como respaldo la dueña debe confirmar el precio/total contra el precio real en el panel admin antes de aceptar cualquier pedido — coherente con el diseño sin backend de pedidos ni pasarela de pago (ver [ADR-0003](../adr/0003-whatsapp-checkout-no-payment-gateway.md)).

## Touchpoints de datos

- `products` (ver [data-model.md](./data-model.md)): lectura de `name`, `price`, `availability` e `is_active` para poblar el carrito y revalidar antes del checkout.
- `localStorage`: única fuente de persistencia del carrito; no hay escritura a Supabase en este flujo.
- Sin tabla de pedidos: el pedido nunca se guarda en la base de datos, solo se envía como mensaje de texto a WhatsApp.

## Preguntas abiertas

- Umbral exacto de longitud de mensaje a partir del cual mostrar un aviso de "pedido muy largo" — se define en la etapa de implementación.
