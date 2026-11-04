# Feature Specification: Aseguramiento de la calidad (Sprint 6 transversal)

**Feature Branch**: `010-quality-assurance`

**Created**: 2026-10-31

**Status**: Draft

**Input**: Cierre de la brecha de aseguramiento de la calidad detectada en la auditoría del
repositorio: falta de CI, ausencia de pruebas de integración reales, trazabilidad incompleta y
verificación manual no registrada. Se alinea con la constitución vigente (§VIII, §20 y §22) y
**no añade dependencias npm**.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Verificación automática en cada cambio (Priority: P1)

Como responsable del proyecto, quiero que cada push y cada pull request ejecute las pruebas,
el typecheck, el lint y el build de ambas capas, para no integrar cambios roto.

**Why this priority**: Es el control mínimo de aseguramiento; sin CI las pruebas existen pero no
protegen al repositorio.

**Independent Test**: Abrir un PR con un cambio válido y comprobar que los cuatro jobs de CI
terminan en verde; introducir un fallo de tipos y comprobar que el job falla.

**Acceptance Scenarios**:

1. **Given** un push o PR a `main`, **When** se ejecuta el workflow, **Then** corren los jobs de
   backend, frontend, integración y auditoría.
2. **Given** un error de TypeScript, **When** se ejecuta CI, **Then** el job correspondiente falla
   y el PR queda bloqueado.
3. **Given** una dependencia de producción con vulnerabilidad alta, **When** se ejecuta la
   auditoría, **Then** el job falla.

---

### User Story 2 - Pruebas de integración contra MySQL real (Priority: P1)

Como responsable de la calidad, quiero probar migraciones, autenticación y el flujo de pedidos
contra una base MySQL real, para detectar fallos que los mocks no revelan.

**Why this priority**: Las 143 pruebas actuales mockean la base de datos; el SQL, las
transacciones y las migraciones no están verificados de extremo a extremo.

**Independent Test**: Ejecutar `npm run test:integration` con una base `cafe_itsh_test` vacía y
comprobar que migra, ejecuta el flujo y limpia sin dejar datos residuales.

**Acceptance Scenarios**:

1. **Given** una base vacía, **When** se aplican las migraciones dos veces, **Then** la segunda
   ejecución no duplica ni falla.
2. **Given** un cliente y un menú publicado, **When** crea un pedido, paga y cocina lo avanza a
   `Listo`, **Then** el pedido queda `Listo` y se registra la notificación.
3. **Given** un pedido de otro cliente, **When** se consulta su detalle, **Then** responde 404.

---

### User Story 3 - Trazabilidad y evidencia de pruebas (Priority: P2)

Como responsable de la entrega, quiero una matriz que relacione cada requisito y criterio de
éxito con su prueba o validación manual, para demostrar cobertura sin depender de una métrica
automática.

**Why this priority**: La constitución no exige cobertura mínima, pero sí exige que la lógica
crítica esté cubierta; la matriz lo hace verificable.

**Independent Test**: Revisar `traceability.md` y comprobar que los 40 FR y 9 SC de la spec 001
tienen una prueba o una validación manual asociada.

**Acceptance Scenarios**:

1. **Given** la matriz de trazabilidad, **When** se busca un FR, **Then** aparece su archivo de
   prueba o la validación manual que lo cubre.
2. **Given** un requisito sin prueba, **When** se revisa la matriz, **Then** queda marcado como
   pendiente o justificado como no automatizable.

---

### User Story 4 - Aceptación manual controlada (Priority: P2)

Como responsable de la calidad, quiero registrar la validación de accesibilidad, rendimiento y
los escenarios del quickstart, para que la aceptación no dependa de una demo informal.

**Why this priority**: Hay requisitos de usabilidad, rendimiento y áreas táctiles ≥ 44 px que no
se cubren con pruebas unitarias.

**Independent Test**: Ejecutar el checklist de accesibilidad y el script de humo de rendimiento,
y registrar los resultados con fecha y entorno.

**Acceptance Scenarios**:

1. **Given** las pantallas de login, menú, caja y cocina, **When** se recorre el checklist,
   **Then** cada punto queda marcado como cumple/no cumple con evidencia.
2. **Given** el backend en ejecución, **When** se ejecuta `scripts/smoke-perf.mjs`, **Then** se
   obtiene el p95 de los endpoints y se compara con el umbral definido.

---

### User Story 5 - Cierre documental y de proceso (Priority: P3)

Como responsable del proyecto, quiero que el roadmap, las tareas y las plantillas de revisión
reflejen el estado real, para mantener la trazabilidad spec-driven.

**Why this priority**: Cierra las dos tareas abiertas del sprint 007 y evita que el QA quede como
un trabajo no documentado.

**Independent Test**: Revisar `Docs/sprints.md`, `specs/007-ui-redesign/tasks.md` y la plantilla
de PR; no deben quedar tareas abiertas sin justificar.

**Acceptance Scenarios**:

1. **Given** el roadmap, **When** se consulta, **Then** existe la sección del Sprint 6 y sus
   criterios de aceptación.
2. **Given** la plantilla de PR, **When** se abre un PR, **Then** incluye la checklist de pruebas,
   seguridad y trazabilidad.

---

### Edge Cases

- Base de datos de integración no disponible: el suite debe fallar con un mensaje claro, no
  colgarse.
- Migración aplicada parcialmente: el runner debe ser idempotente y registrar solo lo aplicado.
- Datos residuales entre pruebas: cada prueba debe usar datos únicos o limpiar tablas
  transaccionales.
- CI sin secretos: las pruebas usan variables de entorno de prueba, nunca `.env` real.
- `npm audit` reporta una vulnerabilidad de desarrollo: el gate solo bloquea producción y
  Dependabot cubre el resto.

## Clarifications

### Session 2026-10-31

- Q: ¿Se añaden dependencias npm para cobertura, E2E o accesibilidad? → A: No; se usan GitHub Actions, `npm audit`, `supertest`, `mysql2` y scripts con APIs nativas.
- Q: ¿Se enmienda la constitución? → A: No; el sprint se alinea con la constitución vigente.
- Q: ¿Cómo se sustituye la métrica de cobertura? → A: Con inventario de pruebas y matriz de trazabilidad FR/SC → prueba.
- Q: ¿Cómo se prueba el flujo completo? → A: Integración API contra MySQL real + quickstart manual; sin E2E de navegador.
- Q: ¿Qué se hace con los fallos del canal de notificación? → A: Se prueban en la suite unitaria; la integración verifica el aviso persistido.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El repositorio MUST ejecutar CI en cada `push` y `pull_request` a `main`.
- **FR-002**: El job de backend MUST ejecutar `test`, `typecheck` y `build`.
- **FR-003**: El job de frontend MUST ejecutar `lint`, `typecheck`, `test` y `build`.
- **FR-004**: CI MUST usar un servicio MySQL 8 y aplicar las migraciones antes de la suite de
  integración.
- **FR-005**: CI MUST ejecutar `npm audit --omit=dev --audit-level=high` en backend y frontend.
- **FR-006**: El repositorio MUST incluir configuración de Dependabot para npm y GitHub Actions.
- **FR-007**: La suite de integración MUST cubrir la idempotencia de migraciones.
- **FR-008**: La suite de integración MUST cubrir login, creación de pedido, pago, transición a
  `En preparación`, `Listo`, notificación y `Entregado`.
- **FR-009**: La suite de integración MUST cubrir permisos por rol y pedido ajeno = 404.
- **FR-010**: La suite de integración MUST usar datos de prueba aislados y limpiar tablas
  transaccionales.
- **FR-011**: El repositorio MUST incluir un inventario de pruebas por archivo y conteo.
- **FR-012**: El repositorio MUST incluir una matriz de trazabilidad de los 40 FR y 9 SC de la
  spec 001.
- **FR-013**: El repositorio MUST incluir una plantilla de pull request con checklist de pruebas,
  seguridad y trazabilidad.
- **FR-014**: El repositorio MUST incluir una bitácora de defectos con plantilla de registro.
- **FR-015**: El repositorio MUST incluir un checklist de accesibilidad para login, menú, caja y
  cocina.
- **FR-016**: El repositorio MUST incluir un script de humo de rendimiento sin dependencias.
- **FR-017**: El roadmap MUST documentar el Sprint 6 y sus criterios de aceptación.
- **FR-018**: El repositorio MUST NOT añadir dependencias npm para este sprint.

### Key Entities

- **Workflow de CI**: conjunto de jobs, servicios y pasos que verifican el repositorio.
- **Suite de integración**: pruebas que usan MySQL real y el runner de migraciones.
- **Matriz de trazabilidad**: relación requisito → prueba/validación → evidencia.
- **Bitácora de defectos**: registro de hallazgos, severidad, estado y corrección.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los PRs a `main` ejecuta CI y requiere el workflow en verde.
- **SC-002**: La suite de integración pasa localmente y en CI contra MySQL 8.
- **SC-003**: Cero vulnerabilidades high/critical en dependencias de producción.
- **SC-004**: El 100 % de los FR y SC de la spec 001 está mapeado en la matriz de trazabilidad.
- **SC-005**: El checklist de accesibilidad y el script de rendimiento se ejecutan y registran.
- **SC-006**: Cero dependencias npm nuevas respecto al estado inicial.

## Assumptions

- El repositorio se aloja en GitHub y Actions está disponible para el proyecto.
- MySQL 8 puede ejecutarse como servicio de CI y localmente para la suite de integración.
- Las pruebas unitarias actuales (114 backend + 29 frontend) se mantienen verdes.
- No se automatiza E2E de navegador ni medición de cobertura en esta iteración por la restricción
  de dependencias; se documentan como límites conocidos.
- La aceptación final sigue sujeta a la demostración funcional ante la patrocinadora.
