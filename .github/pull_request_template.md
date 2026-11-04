## Descripción

<!-- Qué cambia y por qué. Enlaza la spec/tarea si aplica. -->

- Spec/tarea:
- Alcance:

## Tipo de cambio

- [ ] Feature
- [ ] Corrección
- [ ] Refactor
- [ ] Documentación
- [ ] QA / pruebas
- [ ] CI / dependencias

## Verificación

- [ ] `backend`: `npm.cmd test`
- [ ] `backend`: `npm.cmd run typecheck`
- [ ] `backend`: `npm.cmd run build`
- [ ] `frontend`: `npm.cmd run lint`
- [ ] `frontend`: `npm.cmd run typecheck`
- [ ] `frontend`: `npm.cmd test`
- [ ] `frontend`: `npm.cmd run build`
- [ ] `backend`: `npm.cmd run test:integration` (si hay MySQL disponible)
- [ ] `npm.cmd audit --omit=dev --audit-level=high` en ambas capas

## Seguridad y datos

- [ ] No se añadieron secretos, credenciales ni `.env`
- [ ] No se añadieron dependencias npm sin aprobación (§22)
- [ ] Las entradas se validan en el servidor
- [ ] No se exponen trazas ni datos sensibles en errores

## Trazabilidad

- [ ] Actualicé `specs/<sprint>/tasks.md`
- [ ] Actualicé `specs/010-quality-assurance/traceability.md` si cambió un requisito
- [ ] Adjunté evidencia de pruebas manuales (si aplica)

## Notas para revisión

<!-- Riesgos, migraciones, pasos de despliegue o limitaciones conocidas. -->
