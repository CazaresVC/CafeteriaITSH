# Quickstart: Gestión y consulta del menú (Sprint 2)

Guía para validar esta feature de forma autónoma una vez implementadas las historias.

## Prerrequisitos

- Sprint 1 (`002-foundation-auth`) implementado: login, sesión JWT y roles funcionando.
- MySQL 8.0+ con `database/migrations/001_crear_esquema.sql` y `002_seed_inicial.sql`
  aplicados.
- Backend y frontend corriendo (`npm run dev` en cada uno).

## Escenario 1 — El administrador publica el menú (US7, P1)

1. Inicia sesión con un usuario `administrador`.
2. Entra a `/admin/platillos` y crea un platillo, p. ej. "Tacos de guisado" (categoría
   "Comida"), precio $35.00.
3. Entra a `/admin/menu`, selecciona la fecha de hoy y agrega el platillo con precio $35.00;
   márcalo como `especial`.
4. **Resultado esperado**: el ítem aparece en el menú de hoy con su precio y marca de especial.

## Escenario 2 — Cambios visibles de inmediato (US7, P1)

1. En `/admin/menu` cambia el precio del platillo a $40.00 y guárdalo.
2. En `/admin/menu` marca otro platillo como **no disponible**.
3. **Resultado esperado**: al recargar la consulta del menú (Escenario 3) los nuevos precios y
   la disponibilidad se reflejan sin demora.

## Escenario 3 — El cliente consulta el menú (US1, P1)

1. Inicia sesión con un usuario `usuario` (alumno/docente) y entra a `/menu`.
2. **Resultado esperado**: se muestra el menú de hoy con nombre, precio, categoría y el
   destacado como especial.
3. **Resultado esperado**: el platillo marcado como no disponible aparece identificado como
   agotado/no disponible y no puede seleccionarse.

## Escenario 4 — Rapidez en móvil (SC-003)

1. Abre `/menu` en un viewport móvil.
2. **Resultado esperado**: la vista carga con rapidez suficiente para usarse en un receso corto
   y es legible en pantalla pequeña.

## Verificación con pruebas

```bash
# Backend
npm run test -- menu.spec platillos.spec   # desde backend/
# Frontend
npm run test -- Menu.test.tsx              # desde frontend/
```

**Resultado esperado**: pruebas de CRUD de platillos, validación de precio, disponibilidad y
consulta por fecha en verde; prueba de consulta del cliente en verde.

## Verificación manual de errores

- Precio negativo → `400`.
- Duplicar `(fecha, platillo_id)` → `409`.
- Crear platillo con rol no administrador → `403`.
- Consultar menú sin sesión → `401`.
