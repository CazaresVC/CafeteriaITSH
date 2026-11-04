# Tasks: Aseguramiento de la calidad (Sprint 6 transversal)

**Input**: `specs/010-quality-assurance/spec.md`, `plan.md`, `research.md`, `quickstart.md`

**Prerequisites**: Node.js 22, MySQL 8 (solo integración), repositorio con GitHub Actions.

**Tests**: La lógica crítica se cubre con unitarias existentes + integración real. No se añaden
dependencias npm (§22).

**Organization**: Tareas por historia de usuario para implementar y verificar de forma
independiente.

## Phase 1: Documentación del sprint

- [x] T001 Crear `spec.md` con historias, FR-001..FR-018, SC-001..SC-006 y clarificaciones
- [x] T002 Crear `plan.md` con constitution check, estructura y estrategia de pruebas
- [x] T003 Crear `research.md` con las 11 decisiones técnicas y alternativas descartadas
- [x] T004 Crear `quickstart.md` con reproducción local, CI y checklists
- [x] T005 Crear `checklists/requirements.md` con la validación de la spec

## Phase 2: Fundacional (bloquea las historias)

- [ ] T006 Crear `.github/workflows/ci.yml` con jobs backend, frontend, integration y audit
- [ ] T007 Crear `.github/dependabot.yml` para npm (backend/frontend) y GitHub Actions
- [ ] T008 Crear `.github/pull_request_template.md` con checklist de QA y trazabilidad
- [ ] T009 Crear `backend/vitest.integration.config.ts` (include de integración, sin paralelismo)
- [ ] T010 Añadir script `test:integration` en `backend/package.json`
- [ ] T011 Excluir `tests/integration/**` en `backend/vitest.config.ts`
- [ ] T012 Crear `backend/tests/integration/setup.ts` (env, migraciones, cierre del pool)
- [ ] T013 Crear `backend/tests/integration/helpers.ts` (usuarios, menú, limpieza, login)

## Phase 3: US1 — CI en cada cambio (P1)

- [ ] T014 Configurar job `backend` con MySQL service, `test`, `typecheck` y `build`
- [ ] T015 Configurar job `frontend` con `lint`, `typecheck`, `test` y `build`
- [ ] T016 Configurar job `integration` con migraciones y `test:integration`
- [ ] T017 Configurar job `audit` con `npm audit --omit=dev --audit-level=high`
- [ ] T018 Documentar branch protection en `quickstart.md`

## Phase 4: US2 — Integración contra MySQL real (P1)

- [ ] T019 Crear `migraciones.integration.test.ts` (doble ejecución idempotente)
- [ ] T020 Crear `flujo.integration.test.ts` (login → pedido → pago → cocina → listo → entrega)
- [ ] T021 Crear `permisos.integration.test.ts` (rol incorrecto y pedido ajeno = 404)
- [ ] T022 Ejecutar `npm.cmd run test:integration` contra MySQL local y corregir fallos

## Phase 5: US3 — Trazabilidad y evidencia (P2)

- [ ] T023 Crear `Docs/qa/inventario-pruebas.md` con archivos, conteos y niveles
- [ ] T024 Crear `specs/010-quality-assurance/traceability.md` (FR-001..FR-040, SC-001..SC-009)
- [ ] T025 Crear `Docs/qa/bitacora-defectos.md` con plantilla y defectos conocidos
- [ ] T026 Crear `Docs/qa/accesibilidad.md` con checklist y registro de ejecución

## Phase 6: US4 — Aceptación manual (P2)

- [ ] T027 Crear `backend/scripts/smoke-perf.mjs` con `fetch` y `performance.now()`
- [ ] T028 Ejecutar el checklist de accesibilidad y registrar resultados
- [ ] T029 Ejecutar el quickstart del sprint 007 y registrar evidencia

## Phase 7: US5 — Cierre documental (P3)

- [ ] T030 Añadir Sprint 6 a `Docs/sprints.md` con criterios de aceptación
- [ ] T031 Marcar T022/T023 de `specs/007-ui-redesign/tasks.md` con su evidencia
- [ ] T032 Eliminar el archivo accidental `how --stat HEAD`

## Phase 8: Polish y verificación

- [ ] T033 Ejecutar `npm.cmd test`, `typecheck` y `build` en backend
- [ ] T034 Ejecutar `npm.cmd run lint`, `typecheck`, `test` y `build` en frontend
- [ ] T035 Ejecutar `npm.cmd audit --omit=dev --audit-level=high` en ambas capas
- [ ] T036 Revisar que no haya dependencias nuevas en `package.json`/`package-lock.json`
- [ ] T037 Actualizar `checklists/requirements.md` y este `tasks.md` con el estado final

## Dependencies

- T006–T018 dependen de T009–T013.
- T019–T022 dependen de T012–T013 y de MySQL disponible.
- T023–T026 dependen de las suites unitarias e integración.
- T030–T031 dependen de T023–T029.
- T033–T037 dependen de todas las anteriores.

## Parallel Opportunities

- T007, T008 y T011 pueden hacerse en paralelo.
- T019, T020 y T021 pueden escribirse en paralelo; se ejecutan en serie.
- T023, T024, T025 y T026 pueden redactarse en paralelo.
- T030 y T031 pueden hacerse en paralelo.

## Implementation Strategy

1. **MVP (US1 + US2)**: CI e integración real; es el núcleo del aseguramiento.
2. **Incremento 2 (US3 + US4)**: trazabilidad, accesibilidad y rendimiento.
3. **Cierre (US5 + Polish)**: documentación, tareas del sprint 007 y verificación final.

## Notes

- No se añaden dependencias; cualquier tentación de cobertura/E2E se documenta como límite.
- Las pruebas de integración no forman parte de `npm test` para no exigir MySQL en el ciclo
  unitario.
- Los datos de integración usan correos únicos y limpieza de tablas transaccionales.
