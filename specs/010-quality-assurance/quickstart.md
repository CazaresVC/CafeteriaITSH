# Quickstart: Aseguramiento de la calidad (Sprint 6)

Guía para reproducir localmente lo que ejecuta CI y para registrar la aceptación manual.

## Prerrequisitos

- Node.js 22 LTS y npm.
- MySQL 8.0+ en ejecución.
- Git y acceso a GitHub Actions del repositorio.
- Dependencias instaladas en `backend/` y `frontend/` (`npm.cmd ci`).

## 1. Preparar la base de pruebas

```sql
CREATE DATABASE IF NOT EXISTS cafe_itsh_test
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

En PowerShell:

```powershell
$env:DATABASE_URL_TEST = "mysql://root:root@127.0.0.1:3306/cafe_itsh_test"
```

> Ajusta usuario, contraseña y host a tu instalación local. No uses la base de desarrollo.

## 2. Verificación unitaria y estática

```powershell
# Backend
cd backend
npm.cmd test
npm.cmd run typecheck
npm.cmd run build

# Frontend
cd ..\frontend
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

## 3. Integración contra MySQL real

```powershell
cd backend
npm.cmd run test:integration
```

La suite:
1. Aplica las migraciones dos veces y verifica que la segunda es idempotente.
2. Crea usuarios y menú de prueba.
3. Ejecuta login → pedido → pago → cocina → `Listo` → notificación → `Entregado`.
4. Verifica permisos por rol y que un pedido ajeno responde 404.
5. Limpia las tablas transaccionales.

Si la base no está disponible, el suite falla con un mensaje claro; no se debe ejecutar en el
ciclo unitario normal.

## 4. Auditoría de dependencias

```powershell
cd backend
npm.cmd audit --omit=dev --audit-level=high

cd ..\frontend
npm.cmd audit --omit=dev --audit-level=high
```

## 5. Humo de rendimiento

Con el backend en ejecución (`npm.cmd run dev` en otra terminal):

```powershell
cd backend
node scripts/smoke-perf.mjs
```

El script mide p50/p95 de `GET /api/health` y `GET /api/menu` (con cookie de prueba si se
proporciona) y falla si el p95 supera el umbral configurado (`PERF_P95_MS`, por defecto 500 ms).

## 6. Checklist manual de accesibilidad

Registrar el resultado en `Docs/qa/accesibilidad.md` para login, menú, caja y cocina:

- [ ] Navegación completa con teclado (Tab/Shift+Tab) sin trampas de foco.
- [ ] Foco visible en todos los controles interactivos.
- [ ] Contraste de texto ≥ 4.5:1 y de componentes ≥ 3:1.
- [ ] Botones de caja y cocina con área táctil ≥ 44 × 44 px.
- [ ] Etiquetas asociadas a campos de formulario (`label`/`aria-label`).
- [ ] Estados de pedido no dependen solo del color (texto o icono además).
- [ ] Zoom al 200 % sin pérdida de contenido ni solapamientos.
- [ ] Mensajes de error anunciados y asociados al campo.

## 7. Reproducir CI

1. Crear una rama y un pull request a `main`.
2. Verificar en GitHub Actions los jobs `backend`, `frontend`, `integration` y `audit`.
3. Confirmar que el PR no se puede fusionar si el workflow falla (branch protection).
4. Adjuntar en el PR la evidencia de pruebas y, si aplica, capturas del checklist manual.

## 8. Registrar la evidencia

- Inventario de pruebas: `Docs/qa/inventario-pruebas.md`.
- Matriz de trazabilidad: `specs/010-quality-assurance/traceability.md`.
- Accesibilidad: `Docs/qa/accesibilidad.md`.
- Defectos: `Docs/qa/bitacora-defectos.md`.
- Escenarios del sprint 007: `specs/007-ui-redesign/tasks.md` (T022/T023).
