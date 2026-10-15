# Quickstart: Pulido visual por rol

**Feature**: `009-pulido-visual-roles`

## Prerrequisitos

```powershell
cd backend;  npm.cmd run dev   # http://localhost:3000
cd frontend; npm.cmd run dev   # http://localhost:5173
```

Credenciales demo: `admin@cafeitsh.local`/`Admin1234`, `cajero@cafeitsh.local`/`Cajero1234`,
`cocinero@cafeitsh.local`/`Cocinero1234`, `cliente@cafeitsh.local`/`Cliente1234`.

## Recorrido por rol

1. **Admin** (`/admin/usuarios`): tablas legibles, badges de rol/estado, estado vacío ilustrado;
   **Editar** un operativo y ver el cambio.
2. **Admin** → `/admin/menu`: encabezado, resumen del menú de hoy con badges *Especial* / *No
   disponible*, panel Republicar.
3. **Caja** (`/caja`): captura con stepper y total destacado; luego **Entregas**
   (`/caja/entregas`).
4. **Cocina** (`/cocina`): tarjetas con folio y tiempo destacados; avanzar un pedido a `Listo`.
5. **Caja → Entregas**: entregar el pedido `Listo` (desaparece y baja el contador).
6. **Cliente** (`/menu`): tarjetas más atractivas; `/mis-pedidos` con aviso *¡Listo para recoger!*
   cuando el estado es `Listo`.

## Verificación automatizada

```powershell
cd frontend; npm.cmd run typecheck; npm.cmd run lint; npm.cmd test; npm.cmd run build
```

## Criterios de éxito

- **SC-001**: todos los estados vacíos usan `EmptyState`.
- **SC-002**: sin colores fuera de los tokens.
- **SC-003**: Entregas respeta las transiciones del backend.
- **SC-004**: typecheck/lint/test/build en verde.
- **SC-005**: sin deps nuevas; `backend/` y `database/` intactos.
