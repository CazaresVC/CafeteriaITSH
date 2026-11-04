# Research: Aseguramiento de la calidad (Sprint 6 transversal)

Decisiones técnicas para cerrar la brecha de QA sin añadir dependencias npm y sin enmendar la
constitución. Todas respetan §VIII, §20 y §22.

## 1. Plataforma de CI

- **Decisión**: GitHub Actions con un workflow en `.github/workflows/ci.yml`, disparado en `push`
  y `pull_request` a `main`.
- **Rationale**: Es nativo del repositorio, no añade dependencias y permite servicios de MySQL.
- **Alternativas descartadas**: GitLab CI/Jenkins (fuera del hosting actual); scripts locales
  (no bloquean merges).

## 2. Base de datos para integración

- **Decisión**: servicio `mysql:8.0` en CI y base local `cafe_itsh_test` para desarrollo.
- **Rationale**: Verifica SQL real, transacciones, migraciones y restricciones del esquema.
- **Alternativas descartadas**: SQLite (no reproduce MySQL); contenedores por prueba (lento).

## 3. Runner de pruebas de integración

- **Decisión**: `vitest.integration.config.ts` separado, con `include` de
  `tests/integration/**/*.integration.test.ts`, `fileParallelism: false` y setup propio.
- **Rationale**: Aísla la suite real de la unitaria mockeada y evita que `npm test` dependa de
  MySQL.
- **Alternativas descartadas**: mezclar integración en `vitest.config.ts` (obliga a MySQL para
  todo el equipo).

## 4. Datos de prueba y aislamiento

- **Decisión**: crear usuarios con `bcryptjs` (ya instalado) y correos únicos por ejecución;
  limpiar `pedido`, `pedido_detalle`, `pedido_estado_historial`, `pago`, `notificacion` y
  `menu_dia` antes de cada prueba.
- **Rationale**: Evita depender de los seeds de demo y permite ejecuciones repetidas.
- **Alternativas descartadas**: usar las cuentas del seed (acopla las pruebas a contraseñas de
  desarrollo); transacciones por prueba (el runner de migraciones usa otra conexión).

## 5. Migraciones idempotentes

- **Decisión**: invocar `aplicarMigraciones()` dos veces en la suite y comparar el conteo de
  `migracion_aplicada`.
- **Rationale**: Verifica el contrato del runner y que los `IF NOT EXISTS`/`INSERT IGNORE`
  funcionan en MySQL 8.
- **Alternativas descartadas**: confiar solo en la revisión manual de los `.sql`.

## 6. Auditoría de dependencias

- **Decisión**: `npm audit --omit=dev --audit-level=high` en backend y frontend, más Dependabot
  semanal para npm y GitHub Actions.
- **Rationale**: Bloquea vulnerabilidades de producción sin frenar por deps de desarrollo.
- **Alternativas descartadas**: Snyk (dependencia/servicio externo); auditar todo (ruido de dev).

## 7. Trazabilidad sin cobertura automática

- **Decisión**: inventario de pruebas y matriz FR/SC → prueba/validación manual.
- **Rationale**: §20 no exige cobertura mínima; la matriz demuestra que la lógica crítica está
  cubierta sin añadir `@vitest/coverage-v8`.
- **Alternativas descartadas**: instalar cobertura (dependencia nueva); confiar en el conteo de
  pruebas (no demuestra trazabilidad).

## 8. Accesibilidad y rendimiento sin dependencias

- **Decisión**: checklist manual de accesibilidad y `backend/scripts/smoke-perf.mjs` con `fetch`
  y `performance.now()`.
- **Rationale**: Cubre los requisitos de usabilidad/rendimiento sin axe, Playwright ni autocannon.
- **Alternativas descartadas**: axe/Playwright/autocannon (dependencias nuevas); no verificar
  (deja requisitos sin evidencia).

## 9. E2E del flujo principal

- **Decisión**: integración API real (menú → pedido → pago → cocina → listo → notificación →
  entrega) + quickstart manual para la UI.
- **Rationale**: El flujo crítico queda verificado contra MySQL; la UI se valida con el guion ya
  existente.
- **Alternativas descartadas**: Playwright (dependencia nueva); solo mocks (no verifica SQL).

## 10. Proceso de revisión

- **Decisión**: plantilla de PR con checklist de pruebas, seguridad, trazabilidad y evidencia.
- **Rationale**: Convierte el QA en una puerta de revisión explícita.
- **Alternativas descartadas**: revisión informal sin registro.

## 11. Cómo correr (dev)

- **Decisión**: `npm.cmd test` para unitarias; `npm.cmd run test:integration` con
  `DATABASE_URL_TEST`; `npm.cmd run typecheck`; `npm.cmd run lint`; `npm.cmd run build`.
- **Rationale**: Mantiene el flujo Windows documentado en `AGENTS.md` y separa responsabilidades.
