# Quickstart: Republicar el menú del día en un clic

**Feature**: `008-republicar-menu`

## Prerrequisitos

- MySQL con la base `cafe_itsh` y migraciones aplicadas (`database/migrations`).
- Variables de entorno del backend (`backend/.env` con `DATABASE_URL` y `JWT_SECRET`).
- Backend y frontend levantados:

  ```powershell
  cd backend;  npm.cmd run dev   # http://localhost:3000
  cd frontend; npm.cmd run dev   # http://localhost:5173
  ```

## Validación manual (admin)

1. Entrar como admin: `admin@cafeitsh.local` / `Admin1234`.
2. Abrir **Menú** (Admin → `/admin/menu`).
3. Si la fecha de hoy no tiene platillos, verás el estado vacío que sugiere usar Republicar.
4. Pulsar **Republicar** (con la fecha de hoy seleccionada).
5. Esperado: aviso “Se copiaron N platillo(s) del menú del YYYY-MM-DD…” y la tabla de
   “Platillos publicados” se refresca con el menú copiado.
6. Pulsar Republicar de nuevo: esperado `agregados = 0` (`N ya estaban`), sin duplicados.

## Validación manual (cliente)

1. Entrar como cliente: `cliente@cafeitsh.local` / `Cliente1234`.
2. Abrir `/menu`: esperado ver los platillos publicados para hoy.
3. Abrir `/pedido`: esperado poder armar y confirmar el pedido.

## Validación por API

```powershell
# Login (guarda cookie en la sesión)
$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Invoke-WebRequest "http://localhost:3000/api/auth/login" -Method Post `
  -Body '{"correo":"admin@cafeitsh.local","password":"Admin1234"}' `
  -ContentType "application/json" -WebSession $s | Out-Null

# Republicar para hoy (omite fecha)
Invoke-WebRequest "http://localhost:3000/api/menu/republicar" -Method Post `
  -Body '{}' -ContentType "application/json" -WebSession $s | Select-Object -Expand Content
# -> {"fecha":"...","origen":"...","agregados":N,"omitidos":M}
```

## Verificación automatizada

```powershell
cd backend;  npm.cmd test; npm.cmd run typecheck; npm.cmd run build
cd frontend; npm.cmd test; npm.cmd run typecheck; npm.cmd run lint; npm.cmd run build
```

## Criterios de éxito a comprobar

- **SC-001**: destino vacío + origen con N ítems activos → `agregados = N`.
- **SC-002**: repetir → `agregados = 0`, sin duplicados.
- **SC-003**: todos los comandos de la sección anterior en verde.
- **SC-004**: el admin publica el menú del día con **una** acción.
- **SC-005**: sin dependencias npm nuevas; sin cambios en otros roles ni en pedidos.
