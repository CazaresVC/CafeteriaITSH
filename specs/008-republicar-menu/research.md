# Research: Republicar el menú del día en un clic

**Feature**: `008-republicar-menu` | **Date**: 2026-10-14

## Contexto

El seed `database/migrations/002_seed_inicial.sql` publica el menú con `CURRENT_DATE` (la fecha en
que corren las migraciones). Como `menu_dia` se consulta por fecha, en días posteriores el menú
del cliente queda vacío y el admin debe **re-capturar** cada platillo (precio, disponibilidad,
especial). Se requiere una acción eficiente para “mover” el último menú a la fecha actual.

## Decisiones

### 1. Fuente de la copia: fecha publicada más reciente

- **Decisión**: origen = `MAX(fecha)` de `menu_dia` con `fecha <> destino`.
- **Razón**: es la interpretación natural de “republicar”: el último menú publicado se convierte
  en el menú de la nueva fecha. No requiere que el admin elija el origen (menos trabajo).
- **Alternativas descartadas**: copiar del día inmediatamente anterior (falla si hubo un hueco de
  días); copiar del catálogo con precios por defecto (pierde precios/especiales ajustados);
  programar por rango (automatización fuera de alcance).

### 2. Idempotencia y omisión de inactivos

- **Decisión**: un solo `INSERT INTO menu_dia (fecha, platillo_id, precio, disponible, especial)
  SELECT ... FROM menu_dia m JOIN platillo p ON p.id = m.platillo_id AND p.activo = 1 WHERE
  m.fecha = ? AND NOT EXISTS (SELECT 1 FROM menu_dia d WHERE d.fecha = ? AND d.platillo_id =
  m.platillo_id)`.
- **Razón**: la unicidad `(fecha, platillo_id)` es la garantía final contra duplicados; el
  `NOT EXISTS` evita chocar con ella y hace la operación segura al repetirse. El join con
  `p.activo = 1` descarta platillos desactivados.
- **Nota MySQL**: `INSERT ... SELECT` desde la misma tabla está permitido (a diferencia de
  `UPDATE`/`DELETE` con subconsulta de la propia tabla). Verificado contra MySQL 9.x en vivo.

### 3. Contrato de respuesta y errores

- **Decisión**: `200 { fecha, origen, agregados, omitidos }` en **camelCase**; `404` si no hay
  origen; `400` fecha inválida; `403` si no es admin; cuerpo de error uniforme
  `{ error: { codigo, mensaje } }`.
- **Razón**: `agregados`/`omitidos` permiten al admin entender el resultado en un vistazo;
  `origen` documenta de dónde se copió. Coincide con las convenciones del repo.

### 4. Fecha por defecto en el controlador

- **Decisión**: si el cuerpo no trae `fecha`, el controlador usa la fecha de hoy (misma función
  que `listar`).
- **Razón**: el caso de uso principal es “publicar el menú de hoy”; el parámetro existe para
  fechas arbitrarias desde la consola.

### 5. UI de la consola de admin

- **Decisión**: una sección **Republicar** dentro de la tarjeta “Menú del día”, ligada al campo
  de fecha ya existente, con botón primario, ícono, texto de ayuda, aviso de éxito (con
  `agregados` y `origen`) y mensajes de error; el estado vacío sugiere usar Republicar.
- **Razón**: descubrible, sin campos nuevos que aprender; reutiliza el sistema de diseño
  (`primary-container`, tokens `status-*`, radios y superficies). Mantiene ≥ 44 px de área táctil.
- **Alternativas descartadas**: acción automática al abrir la página (efectos en un GET, poco
  predecible); botón sin contexto (menos descubrible).

### 6. Sin dependencias nuevas

- **Decisión**: implementar con Express, `zod`, `mysql2`, React Query y axios ya presentes.
- **Razón**: constitución §22; no se requiere ninguna librería adicional.

## Riesgos y mitigaciones

- **Repetición por doble clic**: mitigado por `NOT EXISTS` + unicidad; el botón se deshabilita
  mientras la mutación está en curso.
- **Sin menú previo (base nueva)**: se responde `404` con mensaje claro; no se crean registros.
- **Zona horaria**: se usa la fecha del servidor de forma consistente con el resto de la app.
