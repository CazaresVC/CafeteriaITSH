# Bitácora de defectos

**Fecha de creación**: 2026-10-31
**Sprint**: 010-quality-assurance

## Plantilla de registro

| Campo | Descripción |
|---|---|
| ID | `DEF-###` |
| Fecha | `YYYY-MM-DD` |
| Severidad | Crítica / Alta / Media / Baja |
| Módulo | auth, menú, pedidos, pagos, cocina, notificaciones, UI, CI |
| Descripción | Qué ocurre y en qué condiciones |
| Pasos | Cómo reproducirlo |
| Esperado | Comportamiento correcto |
| Actual | Comportamiento observado |
| Estado | Abierto / En revisión / Corregido / Cerrado |
| Responsable | Persona asignada |
| Evidencia | Captura, log o prueba |

## Defectos funcionales abiertos

| ID | Fecha | Severidad | Módulo | Descripción | Estado |
|---|---|---|---|---|---|
| — | — | — | — | Sin defectos funcionales abiertos detectados en la ejecución automatizada | — |

## Limitaciones conocidas (no son defectos funcionales)

| ID | Severidad | Área | Descripción | Mitigación |
|---|---|---|---|---|
| LIM-001 | Media | Cobertura | No hay métrica automática de cobertura | Inventario + matriz de trazabilidad |
| LIM-002 | Media | E2E | No hay E2E de navegador | Testing Library + quickstart manual |
| LIM-003 | Baja | Backend | No existe script `lint` | `typecheck` + `build` + revisión |
| LIM-004 | Baja | Integración | La suite real requiere MySQL y credenciales | CI con servicio MySQL 8 |
| LIM-005 | Baja | Rendimiento | El humo mide un entorno local, no concurrencia | Umbral p95 y seguimiento manual |

## Historial

| Fecha | ID | Cambio | Responsable |
|---|---|---|---|
| 2026-10-31 | — | Creación de la bitácora | QA |
