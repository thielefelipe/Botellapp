# Negociación / integración con Mercado Pago Point — notas de sesión

Este archivo es para retomar en una sesión aparte, dedicada solo a este tema.
Contexto separado de `NOTES.md` (que tiene el estado general del proyecto).

## Decisión estratégica tomada

Se descartó (por ahora) que Botellapp se certifique como emisor de boletas
electrónicas ante el SII directamente, o que contrate un OSE (Tupana/FACTO)
para eso. En su lugar:

**Botellapp se integra con terminales de pago que YA emiten boleta legal**
(Transbank POS Integrado o Mercado Pago Point Smart). El comercio consigue
el terminal por su cuenta (no lo vende/arrienda Botellapp). Botellapp se
enfoca en ser el software de inventario/costos/caja/reportes — no la parte
tributaria.

**Confirmado explícitamente con el usuario**: la idea es *integrar* con el
Point Smart vía su API, NO que Botellapp se convierta en su propio
procesador/terminal de pago (eso sería un negocio regulado totalmente
distinto — licencias financieras, alianzas bancarias — descartado).

## Lo que se investigó (por búsqueda web, sin acceso directo a docs — varios
dominios de Mercado Pago y Transbank están bloqueados para fetch directo
desde el sandbox de desarrollo)

- **Transbank POS Integrado**: SDK Web JS oficial (`transbankdevelopers.cl`),
  conecta software vía websocket local (puerto 8090) a un agente instalado
  en el PC de la caja, que a su vez habla con el terminal físico. Compatible
  con boleta electrónica según su documentación.
- **Mercado Pago Point Smart**: emite boleta electrónica incluyendo ventas
  en **efectivo** (no solo tarjeta/QR) — declara todo al SII en tiempo real.
  Requiere contratar el servicio "Boletas y facturas" desde la cuenta
  (requiere permiso de administrador + tener un Point Smart asociado).
  Existe una Orders API (`POST /v1/orders`) para que un software externo
  cree una orden y se la mande al terminal.

## La duda que quedó SIN resolver (crítica para decidir)

¿Se puede registrar una venta 100% en efectivo **vía API**, sin que el
cajero tenga que tocar físicamente el Point Smart para confirmar "Efectivo"?

Lo que sí se confirmó: existe un flujo de registro de efectivo, pero por lo
encontrado (sin acceso a la doc técnica completa) parece requerir
interacción manual en el dispositivo. Si esto es así, el flujo real sería:
- Pago con tarjeta/QR → se puede automatizar vía API casi completo
- Pago en efectivo → Botellapp registra la venta, pero el cajero además
  confirma "Efectivo" en el Point físico para la boleta legal (paso manual
  extra, no 100% automático)

## El usuario está ahora mismo conversando con soporte/ventas de Mercado
Pago para resolver esto. Preguntas que se le dieron para hacer:

1. ¿Necesito credenciales de "plataforma/marketplace" para integrar con
   MUCHOS clientes distintos (cada uno con su propia cuenta MP y su propio
   Point Smart), o cada cliente se integra por separado?
2. ¿Cada cliente necesita su propia cuenta de desarrollador de Mercado
   Pago, o yo gestiono todo desde una cuenta mía?
3. Si mando una venta en efectivo por API, ¿se emite la boleta sola o el
   cajero tiene que confirmar manualmente en el aparato?
4. ¿Existe un endpoint para registrar efectivo sin tocar el aparato?
5. ¿Tienen sandbox de pruebas?
6. ¿Tienen webhooks para avisar cuando se confirma el pago/boleta?
7. ¿El Point Smart funciona sin internet? ¿Qué pasa si se corta a mitad de
   venta?
8. Costo del Point Smart (compra/arriendo) y comisión por transacción.
9. Costo de activar "Boletas y facturas" y requisitos previos del cliente
   (certificado digital, inscripción SII).
10. ¿Hay programa de integradores/desarrolladores con soporte dedicado?

## Próximo paso

Retomar en sesión nueva con las respuestas que dé Mercado Pago. Con esas
respuestas se decide si el flujo de efectivo es aceptable tal como está, o
si conviene evaluar Transbank en paralelo, o buscar otra alternativa.

No se ha escrito ningún código de esta integración todavía — se está a
propósito esperando confirmar estos detalles antes de tocar el sistema de
ventas, porque es una integración de pagos reales y no conviene adivinar
el comportamiento de la API.
