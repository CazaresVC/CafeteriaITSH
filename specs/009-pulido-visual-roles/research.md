# Research: Pulido visual por rol

**Feature**: `009-pulido-visual-roles` | **Date**: 2026-10-14

## Contexto

Los documentos de `desing/` proponen drawer/bottom bar y pantallas nuevas, pero el usuario pidió
**no rediseñar** la estructura ni tocar el backend, priorizando lo **visual** y que cada rol
"cumpla". Se implementa, por tanto, un pulido visual con componentes reutilizables y dos mejoras
de rol que usan endpoints existentes.

## Decisiones

### 1. Componentes de presentación en `components/ui/`
- **Decisión**: crear `badge`, `empty-state`, `stat-card`, `stepper`, `page-header`,
  `confirm-dialog` e `iconos`, con Tailwind puro.
- **Razón**: hoy hay duplicación (el stepper de `Carrito` y `PedidoMostrador` son casi idénticos) y
  estados vacíos repetidos como `<p>` planos. Centralizarlos da consistencia ("atractivo") sin
  dependencias.

### 2. Vista Entregas de caja sin backend
- **Decisión**: `GET /pedidos?estado=Listo` (ya existe, rol cajero/cocinero) + `PATCH
  /pedidos/:id/estado` para `Entregado`/`Cancelado`.
- **Razón**: completa el rol de caja sin endpoints nuevos; las reglas de transición siguen en el
  backend (no se duplican).

### 3. Editar usuario sin backend
- **Decisión**: usar `PATCH /usuarios/:id` (`actualizarOperativoSchema`) para nombre, correo, rol y
  contraseña opcional.
- **Razón**: el endpoint ya existe; mejora natural del CRUD del admin.

### 4. Conservar navegación e identidad de tokens
- **Decisión**: mantener tabs y `LayoutModulo` (solo pulido visual); usar exclusivamente tokens de
  `DESIGN.md`.
- **Razón**: “no lo rediseñes”; el valor pedido es visual.

### 5. No romper pruebas
- **Decisión**: conservar los textos que los tests asertan (p. ej. `2 × Gordita de frijol` como un
  solo nodo de texto); los nuevos componentes no alteran esos nodos.
- **Razón**: los 26 tests deben seguir verdes.

## Riesgos y mitigaciones

- **Regresión de tests por cambio de markup**: se revisan los textos asertados y se corren los
  tests tras cada bloque.
- **Acciones destructivas**: `ConfirmDialog` evita toques accidentales en caja/admin.
- **Alcance**: cualquier elemento que requiera backend queda explícitamente fuera (`spec.md`).
