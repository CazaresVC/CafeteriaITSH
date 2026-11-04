# Implementation Plan: Aseguramiento de la calidad (Sprint 6 transversal)

**Feature**: `010-quality-assurance` | **Date**: 2026-10-31 | **Spec**: `spec.md`

## Summary

Cerrar la brecha de QA sin añadir dependencias: CI en GitHub Actions, suite de integración contra
MySQL real usando `supertest` y `mysql2` ya instalados, auditoría con `npm audit`, Dependabot,
matriz de trazabilidad y validación manual registrada de accesibilidad y rendimiento.

## Technical Context

- **Lenguaje/runtime**: TypeScript estricto, Node.js 22 LTS.
- **Backend**: Express 4, `mysql2/promise`, Vitest 2, `supertest`.
- **Frontend**: React 19, Vite, Vitest 5, ESLint.
- **Base de datos**: MySQL 8.0+.
- **CI**: GitHub Actions (ubuntu-latest) con servicio `mysql:8.0`.
- **Dependencias nuevas**: ninguna (restricción §22 y AGENTS.md).

## Constitution Check

- **§VIII Testing**: se mantienen y amplían las pruebas; se cubre lógica crítica con integración.
- **§20 Testing**: se conservan las pruebas obligatorias y se añade verificación real de SQL.
- **§21 Control de versiones**: PR template, CI y Dependabot refuerzan el flujo.
- **§22 Dependencias**: no se añaden librerías; se usan herramientas ya presentes o nativas.
- **§25/§26 Rendimiento**: se añade un script de humo y un checklist, sin herramienta externa.
- **§29 Aceptación**: se registra la ejecución del flujo completo y del quickstart.

## Project Structure

```text
.github/
  workflows/ci.yml
  dependabot.yml
  pull_request_template.md

backend/
  package.json                      # script test:integration
  vitest.config.ts                  # excluye tests/integration
  vitest.integration.config.ts       # suite de integración
  scripts/smoke-perf.mjs            # humo de rendimiento sin dependencias
  tests/integration/
    setup.ts
    helpers.ts
    migraciones.integration.test.ts
    flujo.integration.test.ts
    permisos.integration.test.ts

specs/010-quality-assurance/
  spec.md
  plan.md
  research.md
  quickstart.md
  tasks.md
  traceability.md
  checklists/requirements.md

Docs/qa/
  inventario-pruebas.md
  accesibilidad.md
  bitacora-defectos.md
```

## Phase Design

### Fase 1 — CI y proceso
- Workflow con jobs `backend`, `frontend`, `integration`, `audit`.
- MySQL service container con base `cafe_itsh_test`.
- Dependabot semanal y plantilla de PR.

### Fase 2 — Integración real
- Configuración separada de Vitest para no mezclar mocks y base real.
- Setup que fija variables de entorno, aplica migraciones y cierra el pool.
- Helpers para crear usuarios y menú con datos únicos y limpiar tablas transaccionales.
- Pruebas de migraciones, flujo completo y permisos/propiedad.

### Fase 3 — Trazabilidad y evidencia
- Inventario de las 143 pruebas actuales y de las nuevas.
- Matriz FR-001..FR-040 y SC-001..SC-009 de la spec 001.
- Bitácora de defectos y checklist de revisión.

### Fase 4 — Aceptación manual
- Checklist de accesibilidad (teclado, foco, contraste, etiquetas, 44 px).
- Script `smoke-perf.mjs` con `fetch` y `performance.now()`.
- Registro de la ejecución del quickstart del sprint 007.

## Testing Strategy

| Nivel | Herramienta | Alcance |
|---|---|---|
| Unitaria backend | Vitest + mocks | 114 pruebas actuales |
| Unitaria frontend | Vitest + Testing Library | 29 pruebas actuales |
| Integración | Vitest + supertest + MySQL | migraciones, flujo, permisos |
| Manual | Quickstart + checklist | accesibilidad, rendimiento, demo |

## Complexity Tracking

| Decisión | Por qué |
|---|---|
| Sin cobertura automática | `@vitest/coverage-v8` es una dependencia nueva; §22 la prohíbe sin aprobación |
| Sin E2E de navegador | Playwright es una dependencia nueva; se sustituye por integración API + manual |
| Sin axe/autocannon | Se sustituyen por checklist y script nativo para respetar §22 |
| Suite de integración separada | Evita que `npm test` dependa de MySQL y mantiene la velocidad del ciclo unitario |

## Risks

- **MySQL local**: la suite de integración falla si no hay base; se documenta en `quickstart.md`.
- **CI más lento**: la integración se separa en un job propio.
- **Datos residuales**: se usan correos únicos y limpieza de tablas transaccionales.
- **`npm audit`**: puede reportar deps de desarrollo; el gate se limita a producción.
- **Flakiness**: la suite usa `fileParallelism: false` y espera explícita.
